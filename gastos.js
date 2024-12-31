document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('category');
    const subcategorySelect = document.getElementById('subcategory');
    const dataTable = document.getElementById('dataTable').querySelector('tbody');
    const fileInput = document.getElementById('fileInput');
    let categorySubcategoryMap = {}; // Relación entre categorías y subcategorías
    let sortOrder = Array(5).fill(true); // Ascendente por defecto para cada columna.

    // Añadir categoría dinámica
    document.getElementById('addCategory').addEventListener('click', () => {
        const newCategory = prompt('Introduce una nueva categoría:');
        if (newCategory && !categorySubcategoryMap[newCategory]) {
            categorySubcategoryMap[newCategory] = [];
            const option = new Option(newCategory, newCategory, true, true);
            categorySelect.add(option);
        }
    });

    // Añadir subcategoría dinámica
    document.getElementById('addSubcategory').addEventListener('click', () => {
        const selectedCategory = categorySelect.value;
        if (!selectedCategory) {
            alert('Selecciona una categoría primero.');
            return;
        }

        const newSubcategory = prompt(`Introduce una nueva subcategoría para "${selectedCategory}":`);
        if (newSubcategory && !categorySubcategoryMap[selectedCategory].includes(newSubcategory)) {
            categorySubcategoryMap[selectedCategory].push(newSubcategory);
            if (categorySelect.value === selectedCategory) {
                const option = new Option(newSubcategory, newSubcategory, true, true);
                subcategorySelect.add(option);
            }
        }
    });

    // Actualizar subcategorías al cambiar de categoría
    categorySelect.addEventListener('change', () => {
        const selectedCategory = categorySelect.value;
        updateSubcategoryOptions(selectedCategory);
    });

    function updateSubcategoryOptions(category) {
        subcategorySelect.innerHTML = '<option value="" disabled selected>Selecciona una subcategoría</option>';
        if (categorySubcategoryMap[category]) {
            categorySubcategoryMap[category].forEach(subcat => {
                const option = new Option(subcat, subcat);
                subcategorySelect.add(option);
            });
        }
    }

    // Añadir fila a la tabla
    document.getElementById('dataForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const category = categorySelect.value;
        const subcategory = subcategorySelect.value;
        const value = document.getElementById('value').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;

        if (!category || !subcategory || !value || !date || !description) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        const month = getFormattedMonth(date);
        const row = dataTable.insertRow();
        row.innerHTML = `
            <td>${category}</td>
            <td>${subcategory}</td>
            <td>${value}</td>
            <td>${date}</td>
            <td>${month}</td>
            <td>${description}</td>
            <td><button class="btn btn-danger btn-sm delete-row">Eliminar</button></td>
        `;

        row.querySelector('.delete-row').addEventListener('click', () => row.remove());
    });

    // Obtener mes formateado
    function getFormattedMonth(dateString) {
        const date = new Date(dateString);
        const months = ['01-ENE', '02-FEB', '03-MAR', '04-ABR', '05-MAY', '06-JUN', '07-JUL', '08-AGO', '09-SEP', '10-OCT', '11-NOV', '12-DIC'];
        return months[date.getMonth()];
    }

    // Ordenar tabla por columnas
    window.sortTable = function (columnIndex) {
        const rows = Array.from(dataTable.rows);
        sortOrder[columnIndex] = !sortOrder[columnIndex];
        rows.sort((a, b) => {
            const valA = a.cells[columnIndex].textContent.trim();
            const valB = b.cells[columnIndex].textContent.trim();
            return sortOrder[columnIndex]
                ? valA.localeCompare(valB, undefined, { numeric: true })
                : valB.localeCompare(valA, undefined, { numeric: true });
        });
        rows.forEach(row => dataTable.appendChild(row));
    };

    // Cargar datos desde Excel
    document.getElementById('uploadExcel').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const workbook = XLSX.read(e.target.result, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

                sheet.forEach(row => {
                    const category = row['Categoría'];
                    const subcategory = row['Subcategoría'];
                    const value = row['Valor (€)'];
                    const date = row['Fecha'];
                    const description = row['Descripción'];
                    const month = getFormattedMonth(date);

                    if (category) {
                        if (!categorySubcategoryMap[category]) {
                            categorySubcategoryMap[category] = [];
                            categorySelect.add(new Option(category, category));
                        }
                        if (subcategory && !categorySubcategoryMap[category].includes(subcategory)) {
                            categorySubcategoryMap[category].push(subcategory);
                        }
                    }

                    const rowElement = dataTable.insertRow();
                    rowElement.innerHTML = `
                        <td>${category}</td>
                        <td>${subcategory}</td>
                        <td>${value}</td>
                        <td>${date}</td>
                        <td>${month}</td>
                        <td>${description}</td>
                        <td><button class="btn btn-danger btn-sm delete-row">Eliminar</button></td>
                    `;
                    rowElement.querySelector('.delete-row').addEventListener('click', () => rowElement.remove());
                });
            };
            reader.readAsBinaryString(file);
        }
    });

    // Guardar datos como Excel
    document.getElementById('downloadExcel').addEventListener('click', () => {
        const rows = [['Categoría', 'Subcategoría', 'Valor (€)', 'Fecha', 'Mes', 'Descripción']];
        Array.from(dataTable.rows).forEach(row => {
            const cells = Array.from(row.cells).slice(0, 6).map(cell => cell.textContent);
            rows.push(cells);
        });
        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
        XLSX.writeFile(workbook, 'datos.xlsx');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const summaryTable = document.createElement('table');
    summaryTable.id = 'summaryTable';
    summaryTable.className = 'table table-bordered table-hover mt-5';
    summaryTable.innerHTML = `
        <thead class="table-dark">
            <tr>
                <th>Mes</th>
                <th>Total (€)</th>
                <th>Entradas</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    document.body.appendChild(summaryTable);

    const updateSummaryTable = () => {
        const dataTable = document.getElementById('dataTable').querySelector('tbody');
        const rows = Array.from(dataTable.rows);
        const summaryData = {};

        rows.forEach(row => {
            const month = row.cells[4].textContent.trim();
            const value = parseFloat(row.cells[2].textContent.trim()) || 0;

            if (!summaryData[month]) {
                summaryData[month] = { total: 0, count: 0 };
            }

            summaryData[month].total += value;
            summaryData[month].count += 1;
        });

        const summaryBody = summaryTable.querySelector('tbody');
        summaryBody.innerHTML = '';
        
        Object.keys(summaryData).sort().forEach(month => {
            const row = summaryBody.insertRow();
            row.innerHTML = `
                <td>${month}</td>
                <td>${summaryData[month].total.toFixed(2)}</td>
                <td>${summaryData[month].count}</td>
            `;
        });
    };

    // Hook into row addition and deletion in the main table
    document.getElementById('dataForm').addEventListener('submit', updateSummaryTable);
    document.getElementById('dataTable').addEventListener('click', event => {
        if (event.target.classList.contains('delete-row')) {
            setTimeout(updateSummaryTable, 0); // Wait for row to be deleted before updating
        }
    });

    document.getElementById('uploadExcel').addEventListener('click', () => {
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', () => {
            setTimeout(updateSummaryTable, 500); // Allow time for Excel processing
        }, { once: true });
    });
});

