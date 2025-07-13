import styles from "./ContactUs.module.css";
import Wallet from "./Wallet/Wallet";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
const ContactUs = ({ onClose }) => {
  return (
    <Wallet title={"Contact Us"} onClose={onClose}>
      <div className={styles.ContactUsModal}>
        <div className={styles.section}>
          <h3>👩‍💼 Online Customer Service</h3>
          <p>Live support available 24/7 via our support portal.</p>
          <a
            href="https://yourdomain.com/support"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.button}
          >
            Go to Support Portal
          </a>
        </div>

        <div className={styles.section}>
          <h3>📧 Email</h3>
          <p>Reach us directly via email:</p>
          <a href="mailto:support@yourdomain.com" className={styles.button}>
            support@yourdomain.com
          </a>
        </div>

        <div className={styles.section}>
          <h3>💬 Chat With Us</h3>
          <div className={styles.chatLinks}>
            <a
              href="https://wa.me/917073237376"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.chatButton}
            >
              <FaWhatsapp
                style={{ marginRight: "8px", height: "1.4em", width: "1.4em" }}
              />
            </a>
            <a
              href="https://t.me/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.chatButton}
            >
              <FaTelegramPlane
                style={{ marginRight: "8px", height: "1.4em", width: "1.4em" }}
              />
            </a>
          </div>
        </div>
      </div>
    </Wallet>
  );
};

export default ContactUs;
