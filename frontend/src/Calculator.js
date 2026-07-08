import React, { useState } from 'react';

function Calculator() {
  const [formData, setFormData] = useState({
    noShowRate: 20,
    staffHoursPerWeek: 30,
    copayCollection: 25,
    revenuePerVisit: 150
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseFloat(value) || value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Error:', error);
    }

    setLoading(false);
  };

  return (
    <div className="calculator-container">
      <h2>ROI Calculator</h2>
      <p className="calculator-subtitle">Enter your practice metrics to see your potential savings</p>

      <form onSubmit={handleSubmit}>
        <div className="calculator-section">
          <h3>Your Practice Metrics</h3>

          <div className="calc-group">
            <label>Current No-Show Rate (%)</label>
            <input type="number" name="noShowRate" value={formData.noShowRate} onChange={handleChange} min="0" max="100" />
            <span className="help-text">National pediatric average: 15-30%</span>
          </div>

          <div className="calc-group">
            <label>Staff Hours on Registration per Week</label>
            <input type="number" name="staffHoursPerWeek" value={formData.staffHoursPerWeek} onChange={handleChange} min="0" />
            <span className="help-text">Hours spent on registration/data entry</span>
          </div>

          <div className="calc-group">
            <label>Current Copay Collection Rate (%)</label>
            <input type="number" name="copayCollection" value={formData.copayCollection} onChange={handleChange} min="0" max="100" />
            <span className="help-text">What % of copays you currently collect</span>
          </div>

          <div className="calc-group">
            <label>Average Revenue per Patient Visit ($)</label>
            <input type="number" name="revenuePerVisit" value={formData.revenuePerVisit} onChange={handleChange} min="0" />
            <span className="help-text">Typical visit fee</span>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate My ROI'}
          </button>
        </div>
      </form>

      {results && (
        <div className="results-section">
          <h3>Your Projected Annual Savings</h3>
          
          <div className="results-grid">
            <div className="result-card">
              <span className="result-label">No-Show Reduction</span>
              <span className="result-value">${results.noShowSavings}</span>
            </div>
            <div className="result-card">
              <span className="result-label">Staff Efficiency</span>
              <span className="result-value">${results.staffSavings}</span>
            </div>
            <div className="result-card">
              <span className="result-label">Copay Collection</span>
              <span className="result-value">${results.copayGain}</span>
            </div>
            <div className="result-card highlight">
              <span className="result-label">Total Annual Benefit</span>
              <span className="result-value">${results.totalAnnualBenefit}</span>
            </div>
          </div>

          <div className="roi-summary">
            <p><strong>Implementation Cost:</strong> ${results.implementationCost}</p>
            <p><strong>Payback Period:</strong> {results.paybackMonths} months</p>
            <p><strong>3-Year ROI:</strong> {results.roi}%</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calculator;
