import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ImageRun, AlignmentType, HeadingLevel } from 'docx';
import MarkdownRenderer from '../components/MarkdownRenderer';
import Mermaid from '../components/Mermaid';
import '../pages/Generator.css'; // Use existing styles for consistency

const Saved = () => {
  const navigate = useNavigate();
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('saved_plc_questions') || '[]');
    setSavedQuestions(data);
  }, []);

  const deleteQuestion = (id) => {
    if (window.confirm('Are you sure you want to delete this saved question?')) {
      const updated = savedQuestions.filter(q => q.id !== id);
      setSavedQuestions(updated);
      localStorage.setItem('saved_plc_questions', JSON.stringify(updated));
    }
  };

  const handleEditSubmit = async () => {
    if (!editPrompt.trim()) return;
    
    const selectedQuestion = savedQuestions.find(q => q.id === selectedId);
    if (!selectedQuestion) return;

    setIsLoadingEdit(true);
    try {
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
      const ENDPOINT = import.meta.env.VITE_GEMINI_API_ENDPOINT || 'https://generativelanguage.googleapis.com/v1';
      
      if (!API_KEY) throw new Error('API Key not found. Please add VITE_GEMINI_API_KEY to your .env file.');

      const prompt = `You are a PLC Expert. I want to modify a previously generated PLC question.
Current Question Data: ${JSON.stringify(selectedQuestion.data)}
Modification Request: ${editPrompt}

CRITICAL: Provide the updated question in the exact same JSON format. Ensure all Mermaid syntax is valid and starts with 'graph TD'.
{
  "narrative": "...",
  "io_table": [ { "component": "...", "address": "...", "type": "...", "description": "..." } ],
  "technical_notes": "...",
  "flowchart_code": "..."
}
Do not include any conversational text. Return ONLY the JSON object.`;
      const response = await fetch(`${ENDPOINT}/models/${MODEL}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.candidates || !result.candidates[0]?.content?.parts[0]?.text) {
        throw new Error('Invalid response structure from AI');
      }

      const textResponse = result.candidates[0].content.parts[0].text;
      
      // Robust JSON extraction: find first '{' and last '}'
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in AI response');
      
      const updatedData = JSON.parse(jsonMatch[0]);

      const updatedQuestions = savedQuestions.map(q => 
        q.id === selectedId ? { ...q, data: updatedData } : q
      );

      setSavedQuestions(updatedQuestions);
      localStorage.setItem('saved_plc_questions', JSON.stringify(updatedQuestions));
      setEditPrompt('');
      setIsEditing(false);
      alert('Question updated successfully!');
    } catch (error) {
      console.error('Error editing question:', error);
      alert(`Edit failed: ${error.message || 'Please try again'}`);
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const prepareExportContent = async (selectedQuestion, includeFlowchart = true) => {
    // 1. Encode Mermaid code for mermaid.ink
    const flowchartCode = selectedQuestion.data.flowchart_code;
    const encodedChart = btoa(unescape(encodeURIComponent(flowchartCode)));
    const chartUrl = `https://mermaid.ink/img/${encodedChart}`;

    // 2. Convert image to Base64 to avoid CORS/Async loading issues
    const fetchImageAsBase64 = async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    const base64Chart = await fetchImageAsBase64(chartUrl);

    // 3. Create a temporary element for professional styling
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.color = '#000';
    element.style.backgroundColor = '#fff';
    element.style.fontFamily = 'Arial, sans-serif';

    element.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px;">
        <h1 style="margin: 0; color: #333;">PLC Examination Question</h1>
        <p style="color: #666;">Generated by PLC Question Generator AI</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #444; border-left: 5px solid #6366f1; padding-left: 10px;">Configuration</h3>
        <p><strong>Scenario:</strong> ${selectedQuestion.config.scenario}</p>
        <p><strong>Hardware:</strong> ${selectedQuestion.config.plcHardware}</p>
        <p><strong>Instructions:</strong> ${selectedQuestion.config.selectedInstructions.join(', ') || 'Standard'}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #444; border-left: 5px solid #6366f1; padding-left: 10px;">Sequence of Operation</h3>
        <div style="line-height: 1.6; text-align: justify;">
          ${selectedQuestion.data.narrative.replace(/\n/g, '<br>')}
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #444; border-left: 5px solid #6366f1; padding-left: 10px;">I/O Table</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Component</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Address</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Type</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
            </tr>
          </thead>
          <tbody>
            ${selectedQuestion.data.io_table.map(row => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${row.component}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${row.address}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${row.type}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${row.description}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${includeFlowchart ? `
      <div style="margin-bottom: 20px; text-align: center;">
        <h3 style="color: #444; border-left: 5px solid #6366f1; padding-left: 10px; text-align: left;">Flowchart</h3>
        <div style="margin-top: 20px;">
          <img src="${base64Chart}" style="max-width: 100%; height: auto; border: 1px solid #eee; padding: 10px; border-radius: 8px;" />
        </div>
      </div>
      ` : ''}

      <div style="margin-top: 30px; font-size: 10px; text-align: center; color: #999;">
        Generated on ${selectedQuestion.date}
      </div>
    `;

    return element;
  };

  const handleExportPDF = async () => {
    if (!selectedQuestion) return;
    try {
      const element = await prepareExportContent(selectedQuestion, false);
      const opt = {
        margin: 10,
        filename: `PLC_Question_${selectedQuestion.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleExportDocx = async () => {
    if (!selectedId) return;
    const selectedQuestion = savedQuestions.find(q => q.id === selectedId);
    if (!selectedQuestion) return;

    try {
      // 2. Create Docx Document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "PLC Examination Question",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: "Generated by PLC Question Generator AI",
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            new Paragraph({
              text: "Configuration",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Scenario: ", bold: true }),
                new TextRun(selectedQuestion.config.scenario || 'N/A'),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Hardware: ", bold: true }),
                new TextRun(selectedQuestion.config.plcHardware || 'N/A'),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Instructions: ", bold: true }),
                new TextRun(selectedQuestion.config.selectedInstructions.join(', ') || 'Standard'),
              ],
            }),
            new Paragraph({ text: "", spacing: { before: 200, after: 200 } }),
            new Paragraph({
              text: "Sequence of Operation",
              heading: HeadingLevel.HEADING_2,
            }),
            ...selectedQuestion.data.narrative.split('\n').filter(p => p.trim()).map(p =>
              new Paragraph({
                children: [new TextRun(p)],
                spacing: { after: 120 },
              })
            ),
            new Paragraph({ text: "", spacing: { before: 200, after: 200 } }),
            new Paragraph({
              text: "I/O Table",
              heading: HeadingLevel.HEADING_2,
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: "Component", bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: "Address", bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: "Type", bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: "Description", bold: true })] }),
                  ],
                }),
                ...selectedQuestion.data.io_table.map(row =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(row.component)] }),
                      new TableCell({ children: [new Paragraph(row.address)] }),
                      new TableCell({ children: [new Paragraph(row.type)] }),
                      new TableCell({ children: [new Paragraph(row.description)] }),
                    ],
                  })
                ),
              ],
            }),
          ],
        }],
      });

      const docBlob = await Packer.toBlob(doc);
      saveAs(docBlob, `PLC_Question_${selectedQuestion.id}.docx`);
      alert('DOCX export successful!');
    } catch (error) {
      console.error('DOCX Export Error:', error);
      alert(`Failed to export DOCX: ${error.message || 'Please try again'}`);
    }
  };

  const handleExportFlowchartPDF = async () => {
    if (!selectedQuestion) return;
    try {
      const flowchartElement = document.querySelector('.mermaid-container');
      if (!flowchartElement) {
        throw new Error('Flowchart element not found.');
      }

      // Create a wrapper for better PDF presentation and force single page fit
      const wrapper = document.createElement('div');
      wrapper.style.padding = '20px';
      wrapper.style.backgroundColor = '#fff';
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.alignItems = 'center';
      wrapper.style.width = '1000px'; // Fixed width to help html2pdf scale it to one page

      const title = document.createElement('h2');
      title.innerText = 'PLC Question Flowchart';
      title.style.marginBottom = '20px';
      title.style.color = '#333';
      title.style.textAlign = 'center';
      
      wrapper.appendChild(title);
      
      // Clone the flowchart element to avoid removing it from DOM
      const chartClone = flowchartElement.cloneNode(true);
      chartClone.style.maxWidth = '100%';
      chartClone.style.height = 'auto';
      wrapper.appendChild(chartClone);
      
      document.body.appendChild(wrapper);

      const opt = {
        margin: 5,
        filename: `PLC_Flowchart_${selectedQuestion.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          width: 1000 
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };
      
      await html2pdf().set(opt).from(wrapper).save();
      document.body.removeChild(wrapper);
    } catch (error) {
      console.error('Flowchart PDF Export Error:', error);
      alert(`Failed to export flowchart PDF: ${error.message || 'Please try again'}`);
    }
  };

  const handleExportJSON = () => {
    if (!selectedQuestion) return;
    const dataStr = JSON.stringify(selectedQuestion, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PLC_Question_${selectedQuestion.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTXT = () => {
    if (!selectedQuestion) return;
    let text = `PLC EXAMINATION QUESTION\n`;
    text += `==================================\n\n`;
    text += `CONFIGURATION\n`;
    text += `-------------\n`;
    text += `Scenario: ${selectedQuestion.config.scenario}\n`;
    text += `Hardware: ${selectedQuestion.config.plcHardware}\n`;
    text += `Instructions: ${selectedQuestion.config.selectedInstructions.join(', ') || 'Standard'}\n\n`;
    text += `SEQUENCE OF OPERATION\n`;
    text += `---------------------\n`;
    text += `${selectedQuestion.data.narrative}\n\n`;
    text += `I/O TABLE\n`;
    text += `----------\n`;
    text += `Component | Address | Type | Description\n`;
    text += `------------------------------------------------------------\n`;
    selectedQuestion.data.io_table.forEach(row => {
      text += `${row.component} | ${row.address} | ${row.type} | ${row.description}\n`;
    });
    text += `\n\nGenerated on: ${selectedQuestion.date}\n`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PLC_Question_${selectedQuestion.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportImage = async () => {
    if (!selectedQuestion) return;
    try {
      const element = await prepareExportContent(selectedQuestion);
      element.style.width = '800px'; // Fixed width for consistent image
      document.body.appendChild(element);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `PLC_Question_${selectedQuestion.id}.png`;
      link.click();
      
      document.body.removeChild(element);
    } catch (error) {
      console.error('Image Export Error:', error);
      alert('Failed to export image. Please try again.');
    }
  };
  const selectedQuestion = savedQuestions.find(q => q.id === selectedId);

  return (
    <div className="generator-container">
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-5">
        <h1 className="generator-header">Saved Questions</h1>
        <button 
          className="btn btn-sm btn-glass" 
          onClick={() => navigate('/generator')}
        >
          + New Question
        </button>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-10">
          {savedQuestions.length === 0 ? (
            <div className="text-center py-5 text-white-50">
              <h3>No saved questions yet.</h3>
              <p>Generate and save some questions to see them here!</p>
            </div>
          ) : (
            <div className="row">
              <div className="col-md-4">
                <div className="list-group-custom">
                  {savedQuestions.map((q) => (
                    <div 
                      key={q.id} 
                      className={`saved-item-card ${selectedId === q.id ? 'active' : ''}`}
                      onClick={() => setSelectedId(q.id)}
                    >
                      <div className="saved-item-header">
                        <span className="saved-item-title">
                          {q.config.scenario || 'Generic Scenario'}
                        </span>
                        <span className="saved-item-date">{q.date}</span>
                      </div>
                      <div className="saved-item-footer">
                        <button 
                          className="btn-delete-small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuestion(q.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-md-8">
                {selectedQuestion ? (
                  <div className="result-card">
                    <div className="result-header">
                      <span className="result-badge">Saved Question</span>
                      <div className="result-actions">
                        <button className="btn-copy" onClick={() => {
                          const text = selectedQuestion.data.narrative;
                          navigator.clipboard.writeText(text);
                          alert('Copied to clipboard!');
                        }}>Copy Text</button>
                        <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit Question</button>
                        <div className="dropdown">
                          <button className="btn-export dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Export
                          </button>
                          <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleExportPDF(); }}>PDF</a></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleExportDocx(); }}>DOCX</a></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleExportFlowchartPDF(); }}>Flowchart (PDF)</a></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleExportJSON(); }}>JSON</a></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleExportTXT(); }}>TXT</a></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleExportImage(); }}>Image</a></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="result-body">
                      {isEditing && (
                        <div className="edit-prompt-container mb-5">
                          <h3 className="section-title mb-3">Edit Question</h3>
                          <textarea 
                            className="form-control-custom mb-3" 
                            placeholder="Enter edit instructions (e.g., 'Change the timer to 10 seconds' or 'Add a second motor')..."
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            rows="3"
                          />
                          <div className="edit-actions">
                            <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                            <button className="btn-submit-edit" onClick={handleEditSubmit} disabled={isLoadingEdit}>
                              {isLoadingEdit ? 'Updating...' : 'Update Question'}
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="output-section mb-5">
                        <h3 className="section-title">Configuration</h3>
                        <div className="config-summary">
                          <p><strong>Scenario:</strong> {selectedQuestion.config.scenario}</p>
                          <p><strong>Hardware:</strong> {selectedQuestion.config.plcHardware}</p>
                          <p><strong>Instructions:</strong> {selectedQuestion.config.selectedInstructions.join(', ') || 'Standard'}</p>
                        </div>
                      </div>
                      <div className="output-section mb-5">
                        <h3 className="section-title">Soal Narasi / Sequence of Operation</h3>
                        <MarkdownRenderer content={selectedQuestion.data.narrative} />
                      </div>
                      <div className="output-section mb-5">
                        <h3 className="section-title">Tabel I/O</h3>
                        <div className="table-responsive">
                          <table className="markdown-table">
                            <thead>
                              <tr>
                                <th>Komponen/Sinyal</th>
                                <th>Alamat I/O</th>
                                <th>Tipe</th>
                                <th>Keterangan</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedQuestion.data.io_table.map((row, idx) => (
                                <tr key={idx}>
                                  <td>{row.component}</td>
                                  <td>{row.address}</td>
                                  <td>{row.type}</td>
                                  <td>{row.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="output-section mb-5">
                        <h3 className="section-title">FlowChart</h3>
                        <Mermaid chart={selectedQuestion.data.flowchart_code} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state-detail text-center py-5 text-white-50">
                    <h3>Select a question from the list to view details.</h3>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Saved;
