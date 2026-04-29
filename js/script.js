document.addEventListener('DOMContentLoaded', function() {
    const table = document.getElementById('periodic-table');
    const tooltip = document.getElementById('tooltip');

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

            elemDiv.addEventListener('mouseenter', (e) => {
                const statesHtml = element.states
                    ? element.states.map((state) => `<div>${state.temperature}: ${state.state}</div>`).join('')
                    : `<div>${element.state}</div>`;

                let madeFromHtml = '';
                if (element.madeFrom) {
                    madeFromHtml = `<div class="tooltip-section"><strong>When combined:</strong> ${element.madeFrom}</div>`;
                }

                tooltip.innerHTML = `
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

                tooltip.style.display = 'block';
                tooltip.style.left = e.pageX + 10 + 'px';
                tooltip.style.top = e.pageY + 10 + 'px';
            });

            elemDiv.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
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