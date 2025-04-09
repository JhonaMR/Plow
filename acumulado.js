const supabaseUrl = 'https://kpjkemxljamumuqwpzfj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwamtlbXhsamFtdW11cXdwemZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNjAzMjEsImV4cCI6MjA1OTYzNjMyMX0.7Icf3Z4kqY8luTQwR4isWeMXTH_cWE3Ezi_8tnDjmoA';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Escuchar evento submit
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('formFiltro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const correria = document.getElementById('correria').value;
    const año = parseInt(document.getElementById('año').value);

    const { data, error } = await supabase
      .from('Acumulado')
      .select('*')
      .eq('CORRERIA', correria)
      .eq('ANIO', año);

    if (error) {
      console.error('Error al obtener datos:', error.message);
      return;
    }

    renderizarTabla(data);
  });
});

function renderizarTabla(data) {
  const tabla = document.getElementById('tablaAcumulado');
  tabla.innerHTML = '';

  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Referencia</th>
      <th>Precio Venta</th>
      <th>Vendidas</th>
      <th>Inventario</th>
      <th>Programada</th>
      <th>Cortadas</th>
      <th>Pendiente</th>
      <th>Venta Total</th>
    </tr>
  `;
  tabla.appendChild(thead);

  const tbody = document.createElement('tbody');

  data.forEach(ref => {
    const vendidas = ref.VENDIDAS ?? 0;
    const inventario = ref.INVENTARIO ?? 0;
    const programada = ref.PROGRAMADA ?? 0;
    const cortadas = ref.CORTADAS ?? 0;
    const precioVenta = ref.PRECIO_VENTA ?? 0;

    const pendiente = vendidas - inventario - programada - cortadas;
    const ventaTotal = vendidas * precioVenta;

    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${ref.REF}</td>
      <td>$${precioVenta.toLocaleString()}</td>
      <td>${vendidas}</td>
      <td contenteditable>${inventario}</td>
      <td contenteditable>${programada}</td>
      <td contenteditable>${cortadas}</td>
      <td>${pendiente}</td>
      <td>$${ventaTotal.toLocaleString()}</td>
    `;
    tbody.appendChild(fila);
  });

  tabla.appendChild(tbody);
}
