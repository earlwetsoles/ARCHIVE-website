document.addEventListener("DOMContentLoaded", () => {
    const foodList = document.getElementById("foodList");
    const searchInput = document.getElementById("searchInput");
    let groceryData = { categories: {}, foods: [] };

    // Fetch the data from your JSON file
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            groceryData = data;
            // Sort foods alphabetically before rendering
            groceryData.foods.sort((a, b) => a.name.localeCompare(b.name));
            renderList(groceryData.foods);
        })
        .catch(error => console.error("Error loading food data:", error));

    // Render the list of foods
    function renderList(foods) {
        foodList.innerHTML = ''; // Clear current list
        
        foods.forEach(food => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "food-item";

            // Check if there is a category tip for this food
            const categoryTip = groceryData.categories[food.category] 
                ? `<div class="category-tip">💡 ${groceryData.categories[food.category]}</div>` 
                : '';

            // Check if there is a season listed
            const seasonWidget = food.season 
                ? `<span class="season-badge">📅 ${food.season}</span>` 
                : '';

            itemDiv.innerHTML = `
                <div class="food-header">
                    <h2>${food.name}</h2>
                </div>
                <div class="food-content">
                    <div class="meta-box">
                        ${seasonWidget}
                        ${categoryTip}
                        <p><strong>Health Meta:</strong> ${food.meta}</p>
                        <p class="avoid-text"><strong>Avoid:</strong> ${food.avoid}</p>
                    </div>
                </div>
            `;

            // Add click event for the dropdown accordion
            const header = itemDiv.querySelector('.food-header');
            header.addEventListener('click', () => {
                const content = itemDiv.querySelector('.food-content');
                const isOpen = content.classList.contains('open');
                
                // Optional: Close all other open dropdowns first
                document.querySelectorAll('.food-content').forEach(c => c.classList.remove('open'));
                
                if (!isOpen) {
                    content.classList.add('open');
                }
            });

            foodList.appendChild(itemDiv);
        });
    }

    // Search functionality
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const filteredFoods = groceryData.foods.filter(food => 
            food.name.toLowerCase().includes(query)
        );
        renderList(filteredFoods);
    });
});
