import { useEffect, useState } from "react";
import axiosInstance from "../../axios";
import { Link } from "react-router-dom";
import "./BillList.css"
function BillsListPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axiosInstance.get("/bills/")
      .then(res => setBills(res.data))
      .catch(err => console.error(err));
  }, []);

  /**
   * Handles delete action with confirmation
   */
  const handleDelete = async (id, description) => {
    if (window.confirm(`Are you sure you want to delete "${description}"?`)) {
      setLoading(true);
      try {
        await axiosInstance.delete(`/bills/${id}/`);
        // Remove the deleted bill from the state
        setBills(bills.filter(b => b.id !== id));
        alert("Bill deleted successfully!");
      } catch (err) {
        console.error("Failed to delete bill:", err);
        alert("Error deleting bill. See console for details.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="dashboard-title">Bills</h2>
      
      {/* 💡 Custom class 'bills-table-wrapper' is used for CSS targeting */}
      <div className="bills-table-wrapper"> 
        <table className="table table-bordered bills-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
              <th className="d-none d-sm-table-cell">Image</th> {/* Hide on extra small screens */}
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {bills.map(b => (
              <tr key={b.id}>
                <td data-label="Description">{b.description}</td>
                <td data-label="Amount">{b.amount}</td>
                <td data-label="Date">{b.date}</td>
                <td data-label="Image" className="d-none d-sm-table-cell"> 
                  <img src={b.image} height="80" alt="Bill" />
                </td>
                <td data-label="Action">
                  <div className="d-flex gap-2">
                    <Link 
                      to={`/dashboard/bills/${b.id}`} 
                      className="btn btn-design "
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-design"
                      onClick={() => handleDelete(b.id, b.description)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}

export default BillsListPage;