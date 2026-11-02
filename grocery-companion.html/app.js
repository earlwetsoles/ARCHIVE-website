(() => {
  "use strict";

  // Keep the data files separate from this application code.
  const DATA_DIRECTORY = "./grocery-companion/data/";
  const FOOD_DATA_FILE = "foods.json";
  const CATEGORY_DATA_FILE = "categories.json";

  const searchInput = document.getElementById("food-search");
  const clearSearchButton = document.getElementById("clear-search");
  const categoryFilters = document.getElementById("category-filters");
  const resultCount = document.getElementById("result-count");
  const collapseAllButton = document.getElementById("collapse-all");
  const foodList = document.getElementById("food-list");
  const notice = document.getElementById("notice");

  const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
  let foods = [];
  let categories = [];
  let activeCategory = "all";

  function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = String(text);
    return element;
  }

  function asTextList(value) {
    if (!Array.isArray(value)) return [];
    return value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim());
  }

  function normalizeCategoryData(data) {
    if (!data || !Array.isArray(data.categories)) {
      throw new Error('categories.json must contain a "categories" array.');
    }

    const seen = new Set();
    return data.categories.map((category, index) => {
      if (!category || typeof category.id !== "string" || !category.id.trim() ||
          typeof category.name !== "string" || !category.name.trim()) {
        throw new Error(`Category entry ${index + 1} needs a non-empty "id" and "name".`);
      }
      const id = category.id.trim();
      if (seen.has(id)) throw new Error(`Duplicate category id: "${id}".`);
      seen.add(id);
      return { id, name: category.name.trim(), tips: asTextList(category.tips) };
    });
  }

  function normalizeFoodData(data, knownCategoryIds) {
    if (!data || !Array.isArray(data.foods)) {
      throw new Error('foods.json must contain a "foods" array.');
    }

    const seen = new Set();
    const warnings = [];
    const normalized = [];

    data.foods.forEach((food, index) => {
      const entryNumber = index + 1;
      if (!food || typeof food.id !== "string" || !food.id.trim() ||
          typeof food.name !== "string" || !food.name.trim()) {
        warnings.push(`Food entry ${entryNumber} was skipped because it needs an "id" and "name".`);
        return;
      }

      const id = food.id.trim();
      if (seen.has(id)) {
        warnings.push(`Food entry ${entryNumber} ("${food.name}") was skipped because id "${id}" is duplicated.`);
        return;
      }
      seen.add(id);

      const categoryIds = Array.isArray(food.categoryIds)
        ? food.categoryIds.filter((idValue) => typeof idValue === "string" && idValue.trim())
          .map((idValue) => idValue.trim())
        : [];

      categoryIds.forEach((categoryId) => {
        if (!knownCategoryIds.has(categoryId)) {
          warnings.push(`"${food.name}" refers to unknown category id "${categoryId}".`);
        }
      });

      let season = null;
      if (food.season && typeof food.season === "object" && typeof food.season.label === "string" && food.season.label.trim()) {
        season = {
          label: food.season.label.trim(),
          note: typeof food.season.note === "string" ? food.season.note.trim() : ""
        };
      }

      const claims = Array.isArray(food.marketingClaims)
        ? food.marketingClaims.filter((claim) => claim && typeof claim.term === "string" && claim.term.trim())
          .map((claim) => ({
            term: claim.term.trim(),
            explanation: typeof claim.explanation === "string" ? claim.explanation.trim() : ""
          }))
        : [];

      normalized.push({
        id,
        name: food.name.trim(),
        categoryIds,
        aliases: asTextList(food.aliases),
        subcategory: typeof food.subcategory === "string" ? food.subcategory.trim() : "",
        season,
        healthNotes: asTextList(food.healthNotes),
        buyingTips: asTextList(food.buyingTips),
        appearance: asTextList(food.appearance),
        avoid: asTextList(food.avoid),
        storageNotes: asTextList(food.storageNotes),
        marketingClaims: claims
      });
    });

    return { foods: normalized, warnings };
  }

  function renderCategoryFilters() {
    categoryFilters.replaceChildren();
    if (!categories.length) return;

    const allButton = makeElement("button", "filter-chip", "All foods");
    allButton.type = "button";
    allButton.dataset.category = "all";
    allButton.setAttribute("aria-pressed", String(activeCategory === "all"));
    categoryFilters.append(allButton);

    categories.forEach((category) => {
      const button = makeElement("button", "filter-chip", category.name);
      button.type = "button";
      button.dataset.category = category.id;
      button.setAttribute("aria-pressed", String(activeCategory === category.id));
      categoryFilters.append(button);
    });
  }

  function addListSection(parent, headingText, items, extraClass = "") {
    if (!items.length) return;
    const section = makeElement("section", `detail-section ${extraClass}`.trim());
    section.append(makeElement("h3", "detail-heading", headingText));
    const list = makeElement("ul", "detail-list");
    items.forEach((item) => list.append(makeElement("li", "", item)));
    section.append(list);
    parent.append(section);
  }

  function addCategoryGuidance(parent, food) {
    const applicable = food.categoryIds
      .map((categoryId) => categories.find((category) => category.id === categoryId))
      .filter((category) => category && category.tips.length);

    applicable.forEach((category) => {
      const section = makeElement("section", "category-guidance");
      section.append(makeElement("h3", "detail-heading", `Category-wide guidance · ${category.name}`));
      const list = makeElement("ul", "detail-list");
      category.tips.forEach((tip) => list.append(makeElement("li", "", tip)));
      section.append(list);
      parent.append(section);
    });
  }

  function addMarketingClaims(parent, claims) {
    if (!claims.length) return;
    const section = makeElement("section", "detail-section");
    section.append(makeElement("h3", "detail-heading", "Marketing claims, decoded"));
    const claimList = makeElement("div", "claim-list");
    claims.forEach((claim) => {
      const card = makeElement("article", "claim");
      card.append(makeElement("p", "claim-term", claim.term));
      if (claim.explanation) card.append(makeElement("p", "claim-explanation", claim.explanation));
      claimList.append(card);
    });
    section.append(claimList);
    parent.append(section);
  }

  function makeFoodCard(food) {
    const details = makeElement("details", "food-card");
    details.dataset.foodId = food.id;

    const summary = makeElement("summary", "food-summary");
    const summaryMain = makeElement("div", "food-summary-main");
    summaryMain.append(makeElement("span", "food-name", food.name));

    const categoryLabels = makeElement("div", "food-category-labels");
    food.categoryIds.forEach((categoryId) => {
      const category = categories.find((item) => item.id === categoryId);
      categoryLabels.append(makeElement("span", "category-label", category ? category.name : categoryId));
    });
    if (food.subcategory) {
      categoryLabels.append(makeElement("span", "category-label subcategory-label", food.subcategory));
    }
    if (categoryLabels.childElementCount) summaryMain.append(categoryLabels);

    const side = makeElement("div", "summary-side");
    if (food.season) side.append(makeElement("span", "season-badge", `Season · ${food.season.label}`));
    side.append(makeElement("span", "chevron", ""));

    summary.append(summaryMain, side);
    details.append(summary);

    const content = makeElement("div", "food-details");
    if (food.season && food.season.note) {
      content.append(makeElement("p", "season-note", food.season.note));
    }

    addListSection(content, "Nutrition & health", food.healthNotes);
    addListSection(content, "Buying guidance", food.buyingTips);
    addListSection(content, "Appearance & ripeness", food.appearance);
    addListSection(content, "Avoid / watch for", food.avoid);
    addListSection(content, "Storage", food.storageNotes);
    addMarketingClaims(content, food.marketingClaims);
    addCategoryGuidance(content, food);

    if (!content.childElementCount) {
      content.append(makeElement("p", "season-note", "No notes have been added for this food yet."));
    }

    details.append(content);
    return details;
  }

  function getVisibleFoods() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    return foods
      .filter((food) => activeCategory === "all" || food.categoryIds.includes(activeCategory))
      .filter((food) => {
        if (!query) return true;
        return [food.name, ...food.aliases].some((value) => value.toLocaleLowerCase().includes(query));
      })
      .sort((a, b) => collator.compare(a.name, b.name));
  }

  function renderFoodList() {
    const visibleFoods = getVisibleFoods();
    foodList.replaceChildren();
    clearSearchButton.hidden = !searchInput.value;
    collapseAllButton.hidden = visibleFoods.length < 1;

    const total = foods.length;
    resultCount.textContent = visibleFoods.length === total
      ? `${total} ${total === 1 ? "food" : "foods"}`
      : `${visibleFoods.length} of ${total} foods`;

    if (!total) {
      const empty = makeElement("div", "empty-state");
      empty.append(makeElement("strong", "", "Your guide is ready for your food list."));
      empty.append(makeElement("p", "", "Add your first entry to grocery-companion/data/foods.json. The app will pick it up automatically when the page is refreshed."));
      foodList.append(empty);
      return;
    }

    if (!visibleFoods.length) {
      const empty = makeElement("div", "empty-state");
      empty.append(makeElement("strong", "", "No matching foods."));
      empty.append(makeElement("p", "", "Try another search or choose a different category."));
      foodList.append(empty);
      return;
    }

    visibleFoods.forEach((food) => foodList.append(makeFoodCard(food)));
  }

  function showError(error) {
    resultCount.textContent = "Guide could not be loaded";
    categoryFilters.replaceChildren();
    foodList.replaceChildren();

    const box = makeElement("div", "error-state");
    box.append(makeElement("strong", "", "Could not load the grocery data."));
    box.append(makeElement("p", "", "Check that both JSON files exist, contain valid JSON, and are uploaded to the same GitHub repository as companion.html."));
    box.append(makeElement("code", "", error && error.message ? error.message : "Unknown loading error"));
    foodList.append(box);
    notice.hidden = false;
    notice.textContent = "Tip: opening companion.html directly from your computer (file://) may block data loading. Test it through your website or a local web server.";
  }

  async function loadGuide() {
    const foodUrl = `${DATA_DIRECTORY}${FOOD_DATA_FILE}`;
    const categoryUrl = `${DATA_DIRECTORY}${CATEGORY_DATA_FILE}`;
    const [foodResponse, categoryResponse] = await Promise.all([
      fetch(foodUrl, { cache: "no-cache" }),
      fetch(categoryUrl, { cache: "no-cache" })
    ]);

    if (!foodResponse.ok) throw new Error(`${FOOD_DATA_FILE}: HTTP ${foodResponse.status}`);
    if (!categoryResponse.ok) throw new Error(`${CATEGORY_DATA_FILE}: HTTP ${categoryResponse.status}`);

    const [foodData, categoryData] = await Promise.all([foodResponse.json(), categoryResponse.json()]);
    categories = normalizeCategoryData(categoryData);
    const normalized = normalizeFoodData(foodData, new Set(categories.map((category) => category.id)));
    foods = normalized.foods;

    if (normalized.warnings.length) {
      notice.hidden = false;
      notice.textContent = `Data check: ${normalized.warnings.join(" ")}`;
    } else {
      notice.hidden = true;
      notice.textContent = "";
    }

    renderCategoryFilters();
    renderFoodList();
  }

  searchInput.addEventListener("input", renderFoodList);

  clearSearchButton.addEventListener("click", () => {
    searchInput.value = "";
    renderFoodList();
    searchInput.focus();
  });

  categoryFilters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    renderCategoryFilters();
    renderFoodList();
  });

  collapseAllButton.addEventListener("click", () => {
    foodList.querySelectorAll("details[open]").forEach((details) => { details.open = false; });
  });

  loadGuide().catch(showError);
})();
