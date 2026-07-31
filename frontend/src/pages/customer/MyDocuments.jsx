import { useEffect, useState } from "react";
import api from "../../api/axios";
import CustomerLayout from "../../components/CustomerLayout";
import { Upload, Download, FileText } from "lucide-react";

function MyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("identity");
  const [message, setMessage] = useState("");
  const [customerId, setCustomerId] = useState(null);

  const fetchAll = () => {
    api.get("/api/my/profile").then((res) => {
      setCustomerId(res.data.id);
      return api.get("/api/my/documents");
    }).then((res) => setDocuments(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !customerId) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", docType);
    try {
      await api.post(`/api/customers/${customerId}/documents`, formData);
      setMessage("Uploaded successfully.");
      setFile(null);
      fetchAll();
    } catch (err) {
      setMessage(err.response?.data?.error || "Upload failed.");
    }
  };

  const handleDownload = (docId, fileName) => {
    api.get(`/api/documents/${docId}/download`, { responseType: "blob" }).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url; link.setAttribute("download", fileName);
      document.body.appendChild(link); link.click(); link.remove();
    });
  };

  return (
    <CustomerLayout>
      <h2 className="text-xl font-semibold text-slate-800 mb-5">My Documents</h2>

      <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6 max-w-md">
        <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2"><Upload size={16} /> Upload Document</h3>
        <form onSubmit={handleUpload} className="space-y-3">
          <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
            <option value="identity">Identity</option>
            <option value="policy">Policy</option>
            <option value="claim">Claim</option>
          </select>
          <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-slate-100 file:text-sm" />
          <button type="submit" className="w-full bg-slate-800 text-white py-2 rounded-md text-sm hover:bg-slate-900">Upload</button>
          {message && <p className="text-xs text-slate-600">{message}</p>}
        </form>
      </div>

      {loading && <p className="text-slate-500 text-sm">Loading...</p>}
      {!loading && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-600">File</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Type</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600"></th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 && (
                <tr><td colSpan="3" className="text-center py-10 text-slate-400"><FileText size={24} className="mx-auto mb-2" />No documents yet</td></tr>
              )}
              {documents.map((d) => (
                <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-800">{d.file_name}</td>
                  <td className="px-5 py-3 text-slate-600 capitalize">{d.document_type}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleDownload(d.id, d.file_name)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs">
                      <Download size={14} /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CustomerLayout>
  );
}

export default MyDocuments;