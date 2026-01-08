import "../error/ErrorLayout.css";

export default function ErrorLayout({code, title, message, children}) {
    return (
        <div className="error-container">
            <h2 className="error-title">{title}</h2>
            <p className="error-message">{message}</p>

            {children}
        </div>
    );
}