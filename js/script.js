document.addEventListener('DOMContentLoaded', function() {
    const table = document.getElementById('periodic-table');
    const tooltip = document.getElementById('tooltip');
    const modal = document.getElementById('element-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close');

    // Close modal when clicking the close button
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    function buildElements(elements) {
        table.innerHTML = `
            <div id="legend">
                <div class="legend-item solid"> Solid</div>
                <div class="legend-item gas">Gas</div>
                <div class="legend-item liquid">Liquid</div>
            </div>
        `;

        elements.forEach((element) => {
            const elemDiv = document.createElement('div');
            elemDiv.className = `element ${element.state}`;
            elemDiv.style.gridColumn = element.group;
            elemDiv.style.gridRow = element.period;

            elemDiv.innerHTML = `
                <div class="number">${element.atomicNumber}</div>
                <div class="symbol">${element.symbol}</div>
            `;

            elemDiv.addEventListener('click', (e) => {
                const statesHtml = element.states
                    ? element.states.map((state) => `<div>${state.temperature}: ${state.state}</div>`).join('')
                    : `<div>${element.state}</div>`;

                let madeFromHtml = '';
                if (element.madeFrom) {
                    madeFromHtml = `<div class="tooltip-section"><strong>When combined:</strong> ${element.madeFrom}</div>`;
                }

                modalBody.innerHTML = `
                    <div class="tooltip-name">${element.name}</div>
                    <div>Symbol: ${element.symbol}</div>
                    <div>Atomic Number: ${element.atomicNumber}</div>
                    <div>Atomic Mass: ${element.atomicMass.toFixed(2)}</div>
                    <div>State at 25°C: <strong>${element.state.charAt(0).toUpperCase() + element.state.slice(1)}</strong></div>
                    <div class="tooltip-section"><strong>State by temperature:</strong>${statesHtml}</div>
                    <div class="tooltip-section"><strong>Usage:</strong> ${element.usage}</div>
                    <div class="tooltip-section"><strong>Found in:</strong> ${element.foundIn}</div>
                    ${madeFromHtml}
                `;

                const rect = elemDiv.getBoundingClientRect();
                const modalContent = modal.querySelector('.modal-content');
                modalContent.style.top = (rect.top + window.scrollY - 250) + 'px';
                modalContent.style.left = (rect.left + window.scrollX - 120) + 'px';
                
                modal.style.display = 'block';
            });

            table.appendChild(elemDiv);
        });
    }

    fetch('data/elements.json')
        .then((response) => response.json())
        .then((data) => buildElements(data))
        .catch((error) => {
            console.error('Could not load elements.json:', error);
            tooltip.innerHTML = '<div class="tooltip-name">Unable to load element data</div>';
        });
});