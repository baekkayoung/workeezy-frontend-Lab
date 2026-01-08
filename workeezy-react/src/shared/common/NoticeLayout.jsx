import "./ErrorLayout.css";

export default function ErrorLayout({code, title, message, children}) {
    return (
        <div className="notice-container">
            <h2 className="notice-title">{title}</h2>
            <p className="notice-message">{message}</p>

            {children}
        </div>
    );
}