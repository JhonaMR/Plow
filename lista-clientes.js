import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kpjkemxljamumuqwpzfj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwamtlbXhsamFtdW11cXdwemZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNjAzMjEsImV4cCI6MjA1OTYzNjMyMX0.7Icf3Z4kqY8luTQwR4isWeMXTH_cWE3Ezi_8tnDjmoA';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
  const { data, error } = await supabase.from('Clientes').select('*');

  if (error) {
    console.error('Error al cargar clientes:', error?.message || error);
    return;
  }

  renderTablaClientes(data);
});

function renderTablaClientes(clientes) {
  const tbody = document.querySelector('#tablaClientes tbody');
  tbody.innerHTML = '';

  clientes.forEach(c => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${c.CLIENTE}</td>
      <td>${c.NOMBRE}</td>
      <td>${c.DIRECCION}</td>
      <td>${c.CIUDAD}</td>
      <td>${c.ZONA}</td>
      <td>${c.VENDEDOR}</td>
    `;
    tbody.appendChild(fila);
  });

  if ($.fn.dataTable.isDataTable('#tablaClientes')) {
    $('#tablaClientes').DataTable().destroy();
  }

  $('#tablaClientes').DataTable({
    paging: false,
    lengthChange: false,
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
    }
  });
}
