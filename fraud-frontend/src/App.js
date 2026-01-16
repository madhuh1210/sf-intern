import React, { useState } from "react";

function App() {
  const [form, setForm] = useState({
    distance_from_home: "",
    distance_from_last_transaction: "",
    ratio_to_median_purchase_price: "",
    repeat_retailer: 0,
    used_chip: 0,
    used_pin_number: 0,
    online_order: 0,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: Number(value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Could not connect to backend. Is FastAPI running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        fontFamily: "Arial",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2>💳 Fraud Detection System</h2>

      <form onSubmit={handleSubmit}>
        {/* Numeric inputs */}
        <label>Distance from home</label>
        <input
          type="number"
          name="distance_from_home"
          value={form.distance_from_home}
          onChange={handleChange}
          required
        />

        <label>Distance from last transaction</label>
        <input
          type="number"
          name="distance_from_last_transaction"
          value={form.distance_from_last_transaction}
          onChange={handleChange}
          required
        />

        <label>Ratio to median purchase price</label>
        <input
          type="number"
          name="ratio_to_median_purchase_price"
          value={form.ratio_to_median_purchase_price}
          onChange={handleChange}
          required
        />

        {/* Binary dropdowns */}
        {[
          ["repeat_retailer", "Repeat retailer"],
          ["used_chip", "Used chip"],
          ["used_pin_number", "Used PIN"],
          ["online_order", "Online order"],
        ].map(([key, label]) => (
          <div key={key} style={{ marginTop: "10px" }}>
            <label>{label}</label>
            <select
              name={key}
              value={form[key]}
              onChange={handleChange}
              style={{ width: "100%", padding: "6px" }}
            >
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </select>
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "15px",
            padding: "10px",
            width: "100%",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {loading ? "Predicting..." : "Predict Fraud"}
        </button>
      </form>

      {/* Error */}
      {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}

      {/* Result */}
      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            borderRadius: "6px",
            background:
              result.is_fraud === 1 ? "#ffe5e5" : "#e5ffe5",
            border:
              result.is_fraud === 1
                ? "1px solid red"
                : "1px solid green",
          }}
        >
          <h3>Prediction Result</h3>
          <p>
            <b>Fraud Probability:</b>{" "}
            {result.fraud_probability.toFixed(3)}
          </p>
          <p>
            <b>Threshold:</b> {result.fraud_threshold.toFixed(3)}
          </p>
          <p>
            <b>Status:</b>{" "}
            {result.is_fraud === 1 ? "🚨 FRAUD" : "✅ NOT FRAUD"}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
