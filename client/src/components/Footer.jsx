import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const LINKS = [
  { to: '/', label: 'होम' }, { to: '/events', label: 'कार्यक्रम' },
  { to: '/booking', label: 'पूजा बुकिंग' }, { to: '/contact', label: 'संपर्क' },
];
const PUJAS = ['रुद्राभिषेक', 'गंगा पूजन', 'विशेष अभिषेक', 'दीपदान', 'सत्यनारायण कथा', 'पितृ तर्पण'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <img src={logo} alt="Gangotri Dham" className="footer__logo" />
            <h4>GANGOTRI DHAM</h4>
            <div className="jai">जय गंगा मैया 🙏</div>
            <p>श्री गंगोत्री धाम — उत्तराखंड के पवित्र चार धामों में से एक, जहाँ माँ गंगा का अवतरण हुआ।</p>
          </div>
          <div className="footer__col">
            <h4>Navigation</h4>
            <ul>{LINKS.map(l => <li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}</ul>
          </div>
          <div className="footer__col">
            <h4>Puja Services</h4>
            <ul>{PUJAS.map(p => <li key={p}><Link to="/booking">{p}</Link></li>)}</ul>
          </div>
        </div>
        <div className="footer__divider" />
        <div className="footer__bottom">
          <p>© 2025 श्री गंगोत्री धाम — All Rights Reserved</p>
          <p>जय माँ गंगे | Jai Maa Gange 🙏</p>
        </div>
      </div>
    </footer>
  );
}
