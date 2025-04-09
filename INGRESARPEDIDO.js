import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = 'https://kpjkemxljamumuqwpzfj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwamtlbXhsamFtdW11cXdwemZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNjAzMjEsImV4cCI6MjA1OTYzNjMyMX0.7Icf3Z4kqY8luTQwR4isWeMXTH_cWE3Ezi_8tnDjmoA'; // <-- asegúrate de ocultar esto en producción
const supabase = createClient(supabaseUrl, supabaseKey);

document.getElementById("importarBtn").addEventListener("click", async () => {
  const archivoInput = document.getElementById("archivoExcel");
  const correria = document.getElementById("correria").value;
  const anio = document.getElementById("anio").value;
  const estado = document.getElementById("estado");

  if (!archivoInput.files.length || !correria || !anio) {
    estado.textContent = "Por favor selecciona el archivo, la correría y el año.";
    return;
  }

  const archivo = archivoInput.files[0];
  const data = await archivo.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const hoja = workbook.Sheets[workbook.SheetNames[0]];

  // 🧾 DATOS DEL CLIENTE (Celdas corregidas)
  const clienteNumero = hoja["N9"]?.v;
  const vendedor = hoja["M7"]?.v || "N/D";
  const porcentaje = hoja["J3"]?.v || "";

  if (!clienteNumero) {
    estado.textContent = "No se pudo leer el número del cliente (celda N9).";
    return;
  }

  // Validar si ya existe pedido del cliente para esta correría y año
  const { data: existe, error: errorExiste } = await supabase
    .from("Pedidos")
    .select("CLIENTE")
    .eq("CLIENTE", clienteNumero)
    .eq("CORRERIA", correria)
    .eq("AÑO", parseInt(anio));

  if (errorExiste) {
    estado.textContent = "Error al validar pedido existente.";
    return;
  }

  if (existe.length > 0) {
    estado.textContent = `Este cliente ya tiene un pedido ingresado para la correría ${correria} ${anio}.`;
    return;
  }

  // 🔢 Consecutivo
  const consecutivo = `${vendedor}-${correria}-${anio}-${clienteNumero}`;

  // 📦 REFERENCIAS (Desde fila 20: REF en B, CANTIDAD en L, PRECIO en M)
  const referencias = [];
  let fila = 20;
  while (true) {
    const refCelda = hoja[`B${fila}`];
    const cantidadCelda = hoja[`L${fila}`];
    const precioCelda = hoja[`M${fila}`];

    if (!refCelda || !cantidadCelda) break;

    const ref = parseInt(refCelda.v);
    const cantidad = parseFloat(cantidadCelda.v);
    const precio = parseFloat(precioCelda?.v || 0);

    if (!isNaN(ref) && cantidad > 0) {
      referencias.push({
        CLIENTE: clienteNumero,
        PORCENTAJE: porcentaje,
        VENDEDOR: vendedor,
        REF: ref,
        CORRERIA: correria,
        AÑO: parseInt(anio),
        CONSECUTIVO: consecutivo,
        CANTIDAD: cantidad,
        PRECIO_VENDIDO: precio,
        DESPACHO: null,
        FACTURA: null,
        REMISION: null,
        NOVEDAD: "",
        FECHA_PEDIDO: new Date().toISOString().split("T")[0],
      });
    }

    fila++;
  }

  if (!referencias.length) {
    estado.textContent = "No se encontraron referencias válidas en el pedido.";
    return;
  }

  // 📤 Enviar a Supabase
  const { error: insertError } = await supabase.from("Pedidos").insert(referencias);

  if (insertError) {
    console.error(insertError);
    estado.textContent = "Error al subir el pedido.";
    return;
  }

  estado.textContent = "✅ Pedido importado exitosamente";
  archivoInput.value = "";
});

async function validarPedidoExistente(cliente, correria, año) {
  try {
    const { data, error } = await supabase
      .from('Pedidos')
      .select('CLIENTE')
      .eq('CLIENTE', cliente)
      .eq('CORRERIA', correria)
      .eq('AÑO', año);

    if (error) {
      console.error("Error al consultar Supabase:", error); // 👈 AGREGADO
      throw new Error("Error al validar pedido existente.");
    }

    return data.length > 0;
  } catch (err) {
    console.error("Excepción en validación de pedido:", err); // 👈 AGREGADO
    throw err;
  }
}
