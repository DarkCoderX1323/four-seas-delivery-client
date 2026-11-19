import React from "react";
import type { Order } from "../context/OrderContext";

interface PaymentReceiptModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

function numberToSpanishWords(amount: number): string {
  const units = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  const teens = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
  const tens = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const hundreds = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

  const entero = Math.floor(amount);
  const decimales = Math.round((amount - entero) * 100);
  const decStr = decimales < 10 ? `0${decimales}` : `${decimales}`;

  if (entero === 0) return `CERO CON ${decStr}/100 SOLES`;
  if (entero === 100) return `CIEN CON ${decStr}/100 SOLES`;

  function convertSection(num: number): string {
    if (num === 0) return "";
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      const u = num % 10;
      const t = Math.floor(num / 10);
      if (t === 2 && u > 0) return `VEINTI${units[u]}`;
      return u === 0 ? tens[t] : `${tens[t]} Y ${units[u]}`;
    }
    if (num === 100) return "CIEN";
    const h = Math.floor(num / 100);
    const rest = num % 100;
    return `${hundreds[h]} ${convertSection(rest)}`.trim();
  }

  let words = "";
  if (entero >= 1000) {
    const miles = Math.floor(entero / 1000);
    const resto = entero % 1000;
    const milesStr = miles === 1 ? "MIL" : `${convertSection(miles)} MIL`;
    words = `${milesStr} ${convertSection(resto)}`.trim();
  } else {
    words = convertSection(entero);
  }

  return `SON: ${words} CON ${decStr}/100 SOLES`;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  order,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const subtotalGravado = Number((order.total / 1.18).toFixed(2));
  const igv = Number((order.total - subtotalGravado).toFixed(2));
  const comprobanteId = order.comprobante?.idComprobante || `B001-${String(order.idPedido).padStart(6, "0")}`;
  const fechaEmision = order.comprobante?.fecha || new Date().toLocaleDateString("es-PE");
  const totalEnLetras = numberToSpanishWords(order.total);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-modal-backdrop" onClick={onClose}>
      <div className="receipt-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-modal-actions-bar no-print">
          <div className="actions-left">
            <span className="receipt-badge-status">✅ Comprobante Oficial Electrónico</span>
          </div>
          <div className="actions-right">
            <button className="btn-print-receipt" onClick={handlePrint}>
              🖨️ Imprimir Ticket / Boleta
            </button>
            <button className="btn-close-receipt" onClick={onClose}>
              ✕ Cerrar
            </button>
          </div>
        </div>

        {/* CONTENEDOR OFICIAL DE LA BOLETA ELECTRÓNICA PARA PANTALLA E IMPRESIÓN */}
        <div id="thermal-receipt-print-area" className="thermal-receipt-ticket">
          {/* Cabecera Empresa */}
          <div className="ticket-center-header">
            <div className="ticket-brand-symbol">🏮</div>
            <h2 className="ticket-company-title">FOUR SEAS INTERNATIONAL HOUSE S.A.C.</h2>
            <p className="ticket-company-subtitle">四海酒家 · RESTAURANTE Y CHIFA CANTONÉS</p>
            <p className="ticket-line">R.U.C. N° 20601234567</p>
            <p className="ticket-line">Av. Rivera Navarrete 501, San Isidro, Lima</p>
            <p className="ticket-line">Central: (01) 421-8899 · WhatsApp: 987 654 321</p>
          </div>

          <div className="ticket-dashed-divider" />

          {/* Cuadro de Boleta Electrónica */}
          <div className="ticket-box-document">
            <h3 className="ticket-doc-type">BOLETA DE VENTA ELECTRÓNICA</h3>
            <p className="ticket-doc-number">{comprobanteId}</p>
          </div>

          <div className="ticket-dashed-divider" />

          {/* Datos del Cliente y Operación */}
          <div className="ticket-details-meta">
            <div className="ticket-meta-row">
              <span className="meta-lbl">FECHA EMISIÓN:</span>
              <span className="meta-val">{fechaEmision} {order.fechaHora}</span>
            </div>
            <div className="ticket-meta-row">
              <span className="meta-lbl">CLIENTE:</span>
              <span className="meta-val">{order.cliente.nombre}</span>
            </div>
            <div className="ticket-meta-row">
              <span className="meta-lbl">TELÉFONO:</span>
              <span className="meta-val">{order.cliente.telefono}</span>
            </div>
            <div className="ticket-meta-row">
              <span className="meta-lbl">DESTINO:</span>
              <span className="meta-val">{order.cliente.direccion}</span>
            </div>
            {order.cliente.referencia && (
              <div className="ticket-meta-row">
                <span className="meta-lbl">REFERENCIA:</span>
                <span className="meta-val">{order.cliente.referencia}</span>
              </div>
            )}
            <div className="ticket-meta-row">
              <span className="meta-lbl">DISTRITO:</span>
              <span className="meta-val">{order.cliente.distrito}</span>
            </div>
            <div className="ticket-meta-row">
              <span className="meta-lbl">FORMA DE PAGO:</span>
              <span className="meta-val">{order.metodoPago}</span>
            </div>
            <div className="ticket-meta-row">
              <span className="meta-lbl">MONEDA:</span>
              <span className="meta-val">SOLES (PEN)</span>
            </div>
          </div>

          <div className="ticket-dashed-divider" />

          {/* Tabla de Productos / Platos */}
          <table className="ticket-items-table">
            <thead>
              <tr>
                <th className="th-qty">CANT</th>
                <th className="th-desc">DESCRIPCIÓN</th>
                <th className="th-price">P.UNIT</th>
                <th className="th-total">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="td-qty">{item.cantidad}</td>
                  <td className="td-desc">
                    <div>{item.nombre}</div>
                    {item.observaciones && (
                      <small className="td-spec">({item.observaciones})</small>
                    )}
                  </td>
                  <td className="td-price">{item.precio.toFixed(2)}</td>
                  <td className="td-total">{(item.precio * item.cantidad).toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td className="td-qty">1</td>
                <td className="td-desc">Servicio Delivery ({order.cliente.distrito})</td>
                <td className="td-price">{order.costoEnvio.toFixed(2)}</td>
                <td className="td-total">{order.costoEnvio.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="ticket-dashed-divider" />

          {/* Desglose Tributario (SUNAT) */}
          <div className="ticket-taxes-summary">
            <div className="tax-row">
              <span>OP. GRAVADA:</span>
              <span>S/ {subtotalGravado.toFixed(2)}</span>
            </div>
            <div className="tax-row">
              <span>I.G.V. (18.00%):</span>
              <span>S/ {igv.toFixed(2)}</span>
            </div>
            <div className="tax-row">
              <span>OP. EXONERADA:</span>
              <span>S/ 0.00</span>
            </div>
            <div className="tax-row ticket-grand-total">
              <span>IMPORTE TOTAL:</span>
              <span>S/ {order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Monto en letras */}
          <p className="ticket-words-amount">{totalEnLetras}</p>

          <div className="ticket-dashed-divider" />

          {/* Pie legal y Código QR */}
          <div className="ticket-footer-legal">
            <div className="ticket-qr-placeholder">
              <div className="qr-sim-box">
                <div className="qr-sim-corner top-left" />
                <div className="qr-sim-corner top-right" />
                <div className="qr-sim-corner bottom-left" />
                <div className="qr-sim-pattern">
                  ■ □ ■ ■ □ ■ ■<br />
                  □ ■ □ ■ □ ■ □<br />
                  ■ ■ □ ■ ■ □ ■<br />
                  □ □ ■ □ ■ □ □<br />
                  ■ ■ □ ■ □ ■ ■
                </div>
              </div>
              <span className="qr-caption">Código Hash: aF49cK01+FsP9=</span>
            </div>

            <p className="ticket-legal-text">
              Representación impresa de la BOLETA DE VENTA ELECTRÓNICA.
              Consulte su validez en www.sunat.gob.pe
            </p>

            <div className="ticket-thanks">
              <p>🏮 ¡GRACIAS POR SU PREFERENCIA! 🏮</p>
              <p>四海酒家 · ¡BUEN PROVECHO!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
