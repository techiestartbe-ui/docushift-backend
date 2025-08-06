// --- CONFIGURATION ---
// This is the most important line in the frontend code.
// It tells the website where to send API requests.
const BACKEND_URL = 'https://docushift-backend.onrender.com';

// --- UI & LOADER CONTROLS ---
const loader = document.getElementById('loader-overlay');
// ... (All other UI and loader control functions remain the same)

// --- TOOL CONFIGURATION ---
const toolConfig = {
    'merge': { endpoint: '/api/merge', outputFilename: 'merged.pdf' },
    // ... all other tool configs
    'pdf-to-word': { endpoint: '/api/pdf-to-word', outputFilename: 'converted.docx' },
};

// --- CORE LOGIC ---
async function processRequest(fullEndpoint, formData, outputFilename) {
    showLoader('Uploading and processing...');
    try {
        const response = await fetch(fullEndpoint, {
            method: 'POST',
            body: formData,
            // We no longer need cors:'cors' here as the server handles it
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: `Server error: ${response.statusText}` }));
            throw new Error(error.message || `An unknown error occurred.`);
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = outputFilename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (error) {
        console.error('An error occurred:', error);
        alert(`An error occurred: ${error.message}`);
    } finally {
        hideLoader();
    }
}

// ... (The rest of the script, including getOptionsAndDispatch,
// modal logic, and the DOMContentLoaded event listener, remain unchanged)

// The QR Code generator now uses the main processRequest function
async function generateQrCode() {
    const text = document.getElementById('qr-text').value;
    if (!text) { alert("Please enter text or a URL."); return; }
    const formData = new FormData();
    formData.append('text', text);
    // Note how we construct the full URL here
    await processRequest(`${BACKEND_URL}/api/qr-code`, formData, 'qrcode.png');
}

// ...