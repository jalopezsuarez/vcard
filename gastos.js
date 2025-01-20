document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('category');
    const sectionSelect = document.getElementById('section');
    const dataTable = document.getElementById('dataTable').querySelector('tbody');
    const fileInput = document.getElementById('fileInput');
    let categorySectionMap = {}; // Relación entre categorias y secciones.
    let sortOrder = Array(5).fill(true); // Ascendente por defecto para cada columna.

    // Añadir categoria dinámica
    document.getElementById('addCategory').addEventListener('click', () => {
        const newCategory = prompt('Introduce una nueva categoria:');
        if (newCategory && !categorySectionMap[newCategory]) {
            categorySectionMap[newCategory] = [];
            const option = new Option(newCategory, newCategory, true, true);
            categorySelect.add(option);
        }
    });

    // Añadir seccion dinámica
    document.getElementById('addSection').addEventListener('click', () => {
        const selectedCategory = categorySelect.value;
        if (!selectedCategory) {
            alert('Selecciona una categoria primero.');
            return;
        }

        const newSubcategory = prompt(`Introduce una nueva seccion para "${selectedCategory}":`);
        if (newSubcategory && !categorySectionMap[selectedCategory].includes(newSubcategory)) {
            categorySectionMap[selectedCategory].push(newSubcategory);
            if (categorySelect.value === selectedCategory) {
                const option = new Option(newSubcategory, newSubcategory, true, true);
                sectionSelect.add(option);
            }
        }
    });

    // Actualizar secciones al cambiar de categoria
    categorySelect.addEventListener('change', () => {
        const selectedCategory = categorySelect.value;
        updateSectionOptions(selectedCategory);
    });

    function updateSectionOptions(category) {
        sectionSelect.innerHTML = '<option value="" disabled selected>Selecciona una seccion</option>';
        if (categorySectionMap[category]) {
            categorySectionMap[category].forEach(section => {
                const option = new Option(section, section);
                sectionSelect.add(option);
            });
        }
    }

    // Añadir fila a la tabla
    document.getElementById('dataForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const category = categorySelect.value;
        const section = sectionSelect.value;
        const value = document.getElementById('value').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;

        if (!category || !section || !value || !date || !description) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        const month = getFormattedMonth(date);
        const row = dataTable.insertRow();
        row.innerHTML = `
            <td nowrap>${category}</td>
            <td nowrap>${section}</td>
            <td nowrap>${value}</td>
            <td nowrap>${date}</td>
            <td nowrap>${month}</td>
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
                    const category = row['Categoria'];
                    const section = row['Seccion'];
                    const value = row['Valor'];
                    const date = row['Fecha'];
                    const description = row['Descripcion'];
                    const month = getFormattedMonth(date);

                    if (category) {
                        if (!categorySectionMap[category]) {
                            categorySectionMap[category] = [];
                            categorySelect.add(new Option(category, category));
                        }
                        if (section && !categorySectionMap[category].includes(section)) {
                            categorySectionMap[category].push(section);
                        }
                    }

                    const rowElement = dataTable.insertRow();
                    rowElement.innerHTML = `
                        <td nowrap>${category}</td>
                        <td nowrap>${section}</td>
                        <td nowrap>${value}</td>
                        <td nowrap>${date}</td>
                        <td nowrap>${month}</td>
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
        const rows = [['Categoria', 'Seccion', 'Valor', 'Fecha', 'Mes', 'Descripcion']];
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
                <th>Total</th>
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
                <td nowrap>${month}</td>
                <td nowrap>${summaryData[month].total.toFixed(2)}</td>
                <td nowrap>${summaryData[month].count}</td>
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

