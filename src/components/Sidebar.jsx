// Sidebar.jsx
// Menú lateral reutilizable que usan los tres paneles (Admin, Graduado,
// Empresa). Cada panel le pasa su propia lista de "items" con ícono,
// etiqueta y una clave interna para saber cuál está seleccionado.
//
// Props:
//   - titulo: texto pequeño arriba del menú (ej: "MENÚ", "EMPRESA", "ADMIN")
//   - items: arreglo de { clave, etiqueta, icono }
//   - activo: la "clave" del item actualmente seleccionado
//   - onSeleccionar(clave): función que se llama al hacer clic en un item

export default function Sidebar({ titulo, items, activo, onSeleccionar }) {
  return (
    <aside className="barra-lateral">
      <div className="titulo-barra-lateral">{titulo}</div>
      {items.map((item) => (
        <button
          key={item.clave}
          className={
            item.clave === activo
              ? "item-barra-lateral item-barra-lateral-activo"
              : "item-barra-lateral"
          }
          onClick={() => onSeleccionar(item.clave)}
        >
          <span className="icono-item">{item.icono}</span>
          {item.etiqueta}
        </button>
      ))}
    </aside>
  );
}
