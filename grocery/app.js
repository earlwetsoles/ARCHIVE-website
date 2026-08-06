// Render the list of foods
    function renderList(foods) {
        foodList.innerHTML = ''; // Clear current list
        
        foods.forEach(food => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "food-item";

            // Category Tip
            const categoryTip = groceryData.categories[food.category] 
                ? `<div class="category-tip">💡 ${groceryData.categories[food.category]}</div>` 
                : '';

            // New: Recommendation Badge (Color codes based on keywords)
            let recClass = 'rec-neutral';
            if (food.recommendation) {
                const recLower = food.recommendation.toLowerCase();
                if (recLower.includes('organic') || recLower.includes('pasture') || recLower.includes('grass') || recLower.includes('wild')) {
                    recClass = 'rec-good';
                }
            }
            const recBadge = food.recommendation 
                ? `<span class="rec-badge ${recClass}">🛒 Target: ${food.recommendation}</span>` 
                : '';

            // Optional Fields based on JSON data
            const metaWidget = food.meta ? `<p><strong>Health:</strong> ${food.meta}</p>` : '';
            const appearanceWidget = food.appearance ? `<p class="appearance-text"><strong>👀 How to Pick:</strong> ${food.appearance}</p>` : '';
            const storageWidget = food.storage ? `<p class="storage-text"><strong>⏳ Storage:</strong> ${food.storage}</p>` : '';
            const avoidWidget = food.avoid ? `<p class="avoid-text"><strong>❌ Avoid:</strong> ${food.avoid}</p>` : '';

            itemDiv.innerHTML = `
                <div class="food-header">
                    <h2>${food.name}</h2>
                </div>
                <div class="food-content">
                    <div class="meta-box">
                        ${recBadge}
                        ${categoryTip}
                        ${metaWidget}
                        ${appearanceWidget}
                        ${storageWidget}
                        ${avoidWidget}
                    </div>
                </div>
            `;

            // Click event for the dropdown accordion
            const header = itemDiv.querySelector('.food-header');
            header.addEventListener('click', () => {
                const content = itemDiv.querySelector('.food-content');
                const isOpen = content.classList.contains('open');
                
                // Close all other open dropdowns first
                document.querySelectorAll('.food-content').forEach(c => c.classList.remove('open'));
                
                if (!isOpen) {
                    content.classList.add('open');
                }
            });

            foodList.appendChild(itemDiv);
        });
    }
