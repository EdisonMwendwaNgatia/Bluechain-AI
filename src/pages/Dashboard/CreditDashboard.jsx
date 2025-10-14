import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ref, set, get } from "firebase/database";
import { db } from "../../firebase";
// import { useNavigate } from "react-router-dom"; // Keep if navigation is needed later, otherwise remove

export default function CreditDashboard() {
  const { user } = useAuth();
  // const navigate = useNavigate(); // Keep if navigation is needed later, otherwise remove
  const [creditFirmData, setCreditFirmData] = useState({
    legalName: "",
    tradeName: "",
    registrationNumber: "",
    physicalAddress: "",
    contactInformation: "",
    dateOfIncorporation: "",
    legalForm: "",
    industryClassification: "",
    directorsOwnersInformation: "",
    licensingRegulatoryStatus: "",
  });
  const [creditFirmLoading, setCreditFirmLoading] = useState(false);
  const [otherCreditFirms, setOtherCreditFirms] = useState([]);
  const [otherFirmsLoading, setOtherFirmsLoading] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Load credit firm data for current user and check if they already have a profile
    (async () => {
      const creditFirmSnap = await get(ref(db, `creditFirm/${user.uid}`));
      if (creditFirmSnap.exists()) {
        setCreditFirmData(creditFirmSnap.val());
        setHasExistingProfile(true);
      }
    })();

    // Always fetch other credit firms on component mount/refresh
    fetchOtherCreditFirms();
  }, [user]);

  const handleCreditFirmInputChange = (e) => {
    const { name, value } = e.target;
    setCreditFirmData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchOtherCreditFirms = async () => {
    setOtherFirmsLoading(true);
    try {
      const snap = await get(ref(db, 'creditFirm'));
      if (snap.exists()) {
        const allFirms = snap.val();
        const firms = Object.entries(allFirms)
          .map(([uid, data]) => ({ uid, ...data }))
          // Filter out the current user's firm from the list (only if they have a saved profile)
          .filter(firm => !hasExistingProfile || firm.uid !== user?.uid);
        setOtherCreditFirms(firms);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOtherFirmsLoading(false);
    }
  };

  const saveCreditFirmProfile = async () => {
    if (!user) return;
    setCreditFirmLoading(true);
    try {
      await set(ref(db, `creditFirm/${user.uid}`), creditFirmData);
      alert("Credit firm profile saved");
      setHasExistingProfile(true);
      
      // Refresh the list of other firms after saving (which will now exclude current user)
      await fetchOtherCreditFirms();
      
      // Optionally navigate after saving
      // navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to save credit firm profile');
    } finally {
      setCreditFirmLoading(false);
    }
  };

  return (
    <div className="credit-dashboard">
      <h2>Credit Firm Information</h2>
      <p>Provide details about your credit firm.</p>
      
      {/* User's Credit Firm Form */}
      <div className="user-credit-firm-form">
        <div className="form-group">
          <label htmlFor="legalName">Legal Name</label>
          <input
            type="text"
            id="legalName"
            name="legalName"
            value={creditFirmData.legalName}
            onChange={handleCreditFirmInputChange}
            placeholder="e.g., ABC Lending Corp."
          />
        </div>
        <div className="form-group">
          <label htmlFor="tradeName">Trade Name (if different)</label>
          <input
            type="text"
            id="tradeName"
            name="tradeName"
            value={creditFirmData.tradeName}
            onChange={handleCreditFirmInputChange}
            placeholder="e.g., FastCash Loans"
          />
        </div>
        <div className="form-group">
          <label htmlFor="registrationNumber">Registration/Incorporation Number</label>
          <input
            type="text"
            id="registrationNumber"
            name="registrationNumber"
            value={creditFirmData.registrationNumber}
            onChange={handleCreditFirmInputChange}
            placeholder="e.g., 123456789"
          />
        </div>
        <div className="form-group">
          <label htmlFor="physicalAddress">Physical Address</label>
          <input
            type="text"
            id="physicalAddress"
            name="physicalAddress"
            value={creditFirmData.physicalAddress}
            onChange={handleCreditFirmInputChange}
            placeholder="e.g., 123 Main St, City, Country"
          />
        </div>
        <div className="form-group">
          <label htmlFor="contactInformation">Contact Information</label>
          <input
            type="text"
            id="contactInformation"
            name="contactInformation"
            value={creditFirmData.contactInformation}
            onChange={handleCreditFirmInputChange}
            placeholder="e.g., +1234567890, info@abclending.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="dateOfIncorporation">Date of Incorporation/Establishment</label>
          <input
            type="date"
            id="dateOfIncorporation"
            name="dateOfIncorporation"
            value={creditFirmData.dateOfIncorporation}
            onChange={handleCreditFirmInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="legalForm">Legal Form</label>
          <input
            type="text"
            id="legalForm"
            name="legalForm"
            value={creditFirmData.legalForm}
            onChange={handleCreditFirmInputChange}
            placeholder="e.g., Corporation, LLC, Sole Proprietorship"
          />
        </div>
        <div className="form-group">
          <label htmlFor="industryClassification">Industry Classification (e.g., NAICS/SIC codes)</label>
          <input
            type="text"
            id="industryClassification"
            name="industryClassification"
            value={creditFirmData.industryClassification}
            onChange={handleCreditFirmInputChange}
            placeholder="e.g., 522291 (Consumer Lending)"
          />
        </div>
        <div className="form-group">
          <label htmlFor="directorsOwnersInformation">Directors/Owners Information</label>
          <textarea
            id="directorsOwnersInformation"
            name="directorsOwnersInformation"
            value={creditFirmData.directorsOwnersInformation}
            onChange={handleCreditFirmInputChange}
            placeholder="e.g., John Doe (CEO), Jane Smith (CFO)"
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="licensingRegulatoryStatus">Licensing and Regulatory Status</label>
          <textarea
            id="licensingRegulatoryStatus"
            name="licensingRegulatoryStatus"
            value={creditFirmData.licensingRegulatoryStatus}
            onChange={handleCreditFirmInputChange}
            placeholder="e.g., Licensed by Central Bank of Kenya, Regulated by XYZ Authority"
          ></textarea>
        </div>
        <div className="form-actions">
          <button onClick={saveCreditFirmProfile} disabled={creditFirmLoading}>
            {creditFirmLoading ? 'Saving...' : 'Save Credit Firm Details'}
          </button>
        </div>
      </div>

      {/* Other Credit Firms Section - Always Visible */}
      <div className="other-credit-firms">
        <h3>Other Credit Firms</h3>
        {otherFirmsLoading ? (
          <p>Loading other credit firms...</p>
        ) : otherCreditFirms.length > 0 ? (
          <div className="firms-grid">
            {otherCreditFirms.map((firm) => (
              <div key={firm.uid} className="firm-card">
                <h4>{firm.legalName}</h4>
                <p><strong>Trade Name:</strong> {firm.tradeName || 'N/A'}</p>
                <p><strong>Contact:</strong> {firm.contactInformation || 'N/A'}</p>
                <p><strong>Address:</strong> {firm.physicalAddress || 'N/A'}</p>
                <p><strong>Registration:</strong> {firm.registrationNumber || 'N/A'}</p>
                {firm.industryClassification && (
                  <p><strong>Industry:</strong> {firm.industryClassification}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No other credit firms found.</p>
        )}
      </div>
    </div>
  );
}