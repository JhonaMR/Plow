import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kpjkemxljamumuqwpzfj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwamtlbXhsamFtdW11cXdwemZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNjAzMjEsImV4cCI6MjA1OTYzNjMyMX0.7Icf3Z4kqY8luTQwR4isWeMXTH_cWE3Ezi_8tnDjmoA';
const supabase = createClient(supabaseUrl, supabaseKey);

document.getElementById('cargarDatos').addEventListener('click', async () => {
  const correria = document.getElementById('correria').value;
  const anio = parseInt(document.getElementById('anio').value);

  if (!correria || !anio) {
    alert('Por favor seleccione una correría y un año');
    return;
  }

  const tabla = $('#tablaReferencias').DataTable();
  tabla.clear().draw();

  console.log('Consultando acumulado con:', { correria, anio });

  const { data: acumulado, error: err1 } = await supabase
    .from('Acumulado') // usa 'acumulado' en minúscula si aplica
    .select('REF, PRECIO_VENTA, INVENTARIO, PROGRAMADAS, CORTADAS')
    .eq('CORRERIA', correria)
    .eq('ANIO', anio);
  
  if (err1) {
    console.error('Error consultando Acumulado:', err1.message);
    return;
  }
  
  if (!acumulado || acumulado.length === 0) {
    console.warn('No se encontraron datos en Acumulado para esa correría y año');
  } else {
    console.log('Acumulado:', acumulado);
  }
  

  // 2. Pedidos
  const { data: pedidos, error: err2 } = await supabase
    .from('Pedidos')
    .select('REF, CANTIDAD')
    .eq('CORRERIA', correria)
    .eq('ANIO', anio);

  if (err2) {
    console.error('Error consultando Pedidos:', err2.message);
    return;
  }
  console.log('Pedidos:', pedidos);

  // 3. Referencias
  const { data: referencias, error: err3 } = await supabase
    .from('Referencias')
    .select('REF, TELA_1, PROM_TELA_1, TELA_2, PROM_TELA_2');

  if (err3) {
    console.error('Error consultando Referencias:', err3.message);
    return;
  }
  console.log('Referencias:', referencias);

  // 4. Agrupar cantidad vendida por REF
  const cantidadesVendidas = {};
  pedidos.forEach(p => {
    if (!cantidadesVendidas[p.REF]) cantidadesVendidas[p.REF] = 0;
    cantidadesVendidas[p.REF] += p.CANTIDAD;
  });
  console.log('Cantidades vendidas agrupadas:', cantidadesVendidas);

  // 5. Armar tabla final
  acumulado.forEach(item => {
    const ref = item.REF;
    const cantidadVendida = cantidadesVendidas[ref] || 0;
    const pendientes = cantidadVendida - (item.INVENTARIO || 0) - (item.PROGRAMADAS || 0) - (item.CORTADAS || 0);

    const refInfo = referencias.find(r => r.REF === ref) || {};

    tabla.row.add([
      ref,
      cantidadVendida,
      item.PRECIO_VENTA ?? '',
      item.INVENTARIO ?? '',
      item.PROGRAMADAS ?? '',
      item.CORTADAS ?? '',
      pendientes,
      refInfo.TELA_1 ?? '',
      refInfo.PROM_TELA_1 ?? '',
      refInfo.TELA_2 ?? '',
      refInfo.PROM_TELA_2 ?? ''
    ]);
  });

  tabla.draw();
});

$('#tablaReferencias').DataTable({
  paging: false,
  lengthChange: false,
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
  }
});
