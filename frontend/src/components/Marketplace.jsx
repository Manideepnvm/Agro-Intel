import { useState, useEffect } from "react";
import './Marketplace.css'; // Import the CSS file
import Mar

function Marketplace() {
    const [items, setItems] = useState([]);

    return (
        <div className="marketplace-container">
            {items.map((item) => (
                <div key={item.id} className="item">
                    <h3>{item.name}</h3>
                    <img src={item.image} alt={item.name} className="item-image" />
                    <p>{item.description}</p>
                    <p>₹{item.price} / {item.unit}</p>
                </div>
            ))}
        </div>
    );
}

export default Marketplace; 