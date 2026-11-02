import React from "react";

const CURRENT_YEAR = 2026;

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <div className="footer-brand">
            <span className="footer-logo">🏮</span>
            <span className="footer-title">Four Seas International House S.A.C.</span>
          </div>
          <p className="footer-desc">
            四海酒家 · Auténtica tradición de gastronomía china cantonesa y chifa
            en Lima. Ingredientes frescos, sazón milenaria y salteados al fuego de wok.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Horarios de Atención</h4>
          <ul className="footer-list">
            <li>Lunes a Domingo: 11:30 AM - 10:30 PM</li>
            <li>Horario corrido almuerzo y cena</li>
            <li>Pedidos delivery y recojo en local</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Zonas de Cobertura</h4>
          <p className="footer-zones">
            San Isidro · Miraflores · Lince · Jesús María · Magdalena del Mar ·
            Pueblo Libre · San Borja · Surquillo
          </p>
          <div className="footer-contact">
            <span>📞 Central Delivery: (01) 421-XXXX</span>
            <span>📱 WhatsApp Pedidos: +51 987 654 321</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {CURRENT_YEAR} Four Seas International House S.A.C. Todos los derechos reservados.</p>
        <p className="footer-tech">Desarrollado por los alumnos de la UTP - GRUPO 3</p>
      </div>
    </footer>
  );
};
