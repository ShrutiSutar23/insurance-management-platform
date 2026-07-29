import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import { Upload, FileText, Download, FolderOpen, Loader2, Trash2 } from "lucide-react";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function Documents() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [error, setError] = useState("");

  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("identity");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    api
      .get("/api/customers")
      .then((response) => setCustomers(response.data.data))
      .catch(() => setError("Could not load customers."));
  }, []);

  const fetchDocuments = (customerId) => {
    if (!customerId) {
      setDocuments([]);
      return;
    }
    setLoadingDocs(true);
    api
      .get(`/api/customers/${customerId}/documents`)
      .then((response) => setDocuments(response.data))
      .catch(() => setError("Could not load documents."))
      .finally(() => setLoadingDocs(false));
  };

  const handleCustomerChange = (e) => {
    const id = e.target.value;
    setSelectedCustomerId(id);
    setUploadMessage("");
    fetchDocuments(id);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setUploadMessage("Select a customer first.");
      return;
    }
    if (!file) {
      setUploadMessage("Choose a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", docType);

    setUploading(true);
    setUploadMessage("");

    try {
      await api.post(`/api/customers/${selectedCustomerId}/documents`, formData);
      setUploadMessage("Document uploaded successfully.");
      setFile(null);
      fetchDocuments(selectedCustomerId);
    } catch (err) {
      setUploadMessage(err.response?.data?.error || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (docId, fileName) => {
    api
      .get(`/api/documents/${docId}/download`, { responseType: "blob" })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(() => setError("Could not download document."));
  };

  const handleDelete = (docId) => {
    if (!window.confirm("Delete this document? This cannot be undone.")) {
      return;
    }
    api
      .delete(`/api/documents/${docId}`)
      .then(() => {
        fetchDocuments(selectedCustomerId);
      })
      .catch(() => setError("Could not delete document."));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main className="flex-1 ml-64">
        <header className="bg-white border-b border-slate-200 px-8 py-5">
          <h2 className="text-xl font-semibold text-slate-800">Documents</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Upload and manage customer documents
          </p>
        </header>

        {error && (
          <div className="mx-8 mt-4 bg-red-50 text-red-700 text-sm px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Customer
              </label>
              <select
                value={selectedCustomerId}
                onChange={handleCustomerChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose a customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <Upload size={16} /> Upload Document
              </h3>

              <form onSubmit={handleUpload} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="identity">Identity</option>
                    <option value="policy">Policy</option>
                    <option value="claim">Claim</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">File (PDF, PNG, JPG)</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-slate-100 file:text-slate-700 file:text-sm hover:file:bg-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-slate-800 text-white py-2 rounded-md text-sm hover:bg-slate-900 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading && <Loader2 size={16} className="animate-spin" />}
                  {uploading ? "Uploading..." : "Upload Document"}
                </button>

                {uploadMessage && (
                  <p className={`text-xs ${uploadMessage.includes("success") ? "text-emerald-600" : "text-red-600"}`}>
                    {uploadMessage}
                  </p>
                )}
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                <FolderOpen size={16} className="text-slate-500" />
                <h3 className="text-sm font-medium text-slate-700">Uploaded Documents</h3>
              </div>

              {!selectedCustomerId && (
                <div className="flex flex-col items-center text-slate-400 py-16">
                  <FileText size={28} className="mb-2" />
                  <p className="text-sm">Select a customer to view their documents</p>
                </div>
              )}

              {selectedCustomerId && loadingDocs && (
                <p className="text-slate-500 text-sm px-5 py-6">Loading documents...</p>
              )}

              {selectedCustomerId && !loadingDocs && (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-5 py-3 font-medium text-slate-600">File Name</th>
                      <th className="text-left px-5 py-3 font-medium text-slate-600">Type</th>
                      <th className="text-left px-5 py-3 font-medium text-slate-600">Uploaded</th>
                      <th className="text-left px-5 py-3 font-medium text-slate-600"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-12">
                          <div className="flex flex-col items-center text-slate-400">
                            <FileText size={28} className="mb-2" />
                            <p className="text-sm">No documents uploaded yet</p>
                          </div>
                        </td>
                      </tr>
                    )}
                    {documents.map((d) => (
                      <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="px-5 py-3 text-slate-800 font-medium truncate max-w-xs">{d.file_name}</td>
                        <td className="px-5 py-3 text-slate-600 capitalize">{d.document_type}</td>
                        <td className="px-5 py-3 text-slate-500">{formatDate(d.uploaded_at)}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleDownload(d.id, d.file_name)}
                              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              <Download size={14} /> Download
                            </button>
                            <button
                              onClick={() => handleDelete(d.id)}
                              className="flex items-center gap-1.5 text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Documents;