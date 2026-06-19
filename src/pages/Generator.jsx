import React, { useState } from 'react';
import './Generator.css';
import MarkdownRenderer from '../components/MarkdownRenderer';
import Mermaid from '../components/Mermaid';
import NumberStepper from '../components/NumberStepper';
import { supabase } from '../lib/supabaseClient';

const OMRON_INSTRUCTIONS = [
  { id: 'TIM', label: 'Timer (TIM)' },
  { id: 'CNT', label: 'Counter (CNT)' },
  { id: 'KEEP', label: 'Keep (KEEP)' },
  { id: 'SET', label: 'Set (SET)' },
  { id: 'RSET', label: 'Reset (RSET)' },
  { id: 'MOV', label: 'Move (MOV)' },
  { id: 'CMP', label: 'Compare (CMP)' },
  { id: 'INC', label: 'Increment (INC)' },
  { id: 'DEC', label: 'Decrement (DEC)' },
  { id: 'BKR', label: 'Break (BKR)' },
  { id: 'DIFF', label: 'Differentiate (DIFF)' },
  { id: 'AUX', label: 'Kontak Bantu (Auxiliary)' },
  { id: 'INTERLOCK', label: 'Interlock' },
  { id: 'TMR_ON', label: 'Timer On-Delay' },
  { id: 'TMR_OFF', label: 'Timer Off-Delay' },
];

const Generator = () => {
  const [formData, setFormData] = useState({
    scenario: '',
    selectedInstructions: [],
    inputCount: '',
    outputCount: '',
    stepCount: '7',
    operationMode: 'Automatic',
    branchingFlow: 'Linear',
    plcHardware: 'Omron CP1E',
    customText: ''
  });
  const [isInstrOpen, setIsInstrOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleInstruction = (id) => {
    setFormData(prev => {
      const current = prev.selectedInstructions;
      const updated = current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id];
      return { ...prev, selectedInstructions: updated };
    });
  };

  const handleSave = async () => {
    if (!result || !result.data) {
      alert('Nothing to save! Please generate a question first.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const isLocalhost = window.location.hostname === 'localhost';

      if (!user) {
        if (isLocalhost) {
          // Fallback to localStorage for local development
          const localSaved = JSON.parse(localStorage.getItem('plc_saved_questions_local') || '[]');
          const newEntry = {
            id: Date.now().toString(), // Simple unique ID for local
            date: new Date().toLocaleString(),
            config: formData,
            data: result.data
          };
          localStorage.setItem('plc_saved_questions_local', JSON.stringify([...localSaved, newEntry]));
          alert('Saved locally (Guest Mode) since you are on localhost!');
          return;
        }

        alert('Please login first to save questions!');
        window.location.href = '/auth';
        return;
      }

      const { error } = await supabase
        .from('saved_questions')
        .insert([
          {
            user_id: user.id,
            question_data: {
              date: new Date().toLocaleString(),
              config: formData,
              data: result.data
            }
          }
        ])
        .select();

      if (error) throw error;

      alert('Question saved successfully to your account!');
    } catch (error) {
      console.error('Save Error:', error);
      alert('Error saving question: ' + error.message);
    }
  };

  const generateQuestion = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
    const ENDPOINT = import.meta.env.VITE_GEMINI_API_ENDPOINT || 'https://generativelanguage.googleapis.com/v1';
    if (!API_KEY) {
      setResult({ error: 'API Key not found. Please add VITE_GEMINI_API_KEY to your .env file.' });
      setIsLoading(false);
      return;
    }

    const inputDisplay = (formData.inputCount === '0' || formData.inputCount === 0) 
      ? 'Flexible/Not specified' 
      : (formData.inputCount || 'N/A');
    const outputDisplay = (formData.outputCount === '0' || formData.outputCount === 0) 
      ? 'Flexible/Not specified' 
      : (formData.outputCount || 'N/A');

    const prompt = `
      You are a world-class PLC (Programmable Logic Controller) Instructor and Industrial Automation Expert.
      Your goal is to generate a professional, technically rigorous, and clearly articulated examination question for students.

      ### Configuration:
      - Hardware: ${formData.plcHardware}
      - Scenario: ${formData.scenario || 'Generic Industrial Process'}
      - Required I/O: ${inputDisplay} Inputs, ${outputDisplay} Outputs
      - Operation Mode: ${formData.operationMode}
      - Branching Flow: ${formData.branchingFlow}
      - Target Behaviors (Do NOT name the instructions): ${formData.selectedInstructions.length > 0 ? formData.selectedInstructions.join(', ') : 'Standard industrial logic'}
      - Additional Requirements: ${formData.customText || 'None'}

      ### Articulation & Quality Guidelines:
      The narrative must be articulated with extreme clarity to avoid student ambiguity. Follow these rules:
      1. **Instructional Stealth (CRITICAL):** NEVER explicitly mention the name of a PLC instruction (e.g., do NOT say "Use a Timer", "Use a Counter", "Use KEEP", "Use SET/RSET"). Instead, describe the *behavior* that requires it. 
         - Instead of "Use a Timer for 5s", say "Wait for 5 seconds before the next action occurs".
         - Instead of "Use a KEEP/Latching instruction", say "The output must remain active even after the trigger button is released".
         - Instead of "Use a Counter", say "The process repeats 5 times before stopping".
      2. **Logical Sequence:** Organize the flow from Initial State $\rightarrow$ Trigger $\rightarrow$ Process $\rightarrow$ Completion/Safety.
      3. **Technical Precision:** Use professional industrial terms (e.g., "Interlock", "Latching", "Edge Triggering") but ensure the logic is easy to follow.
      4. **No Ambiguity:** Avoid vague terms. Instead of "then it starts", use "Once Sensor A is activated AND the Start Button is pressed, the Motor shall start".
      5. **Explicit Conditions:** Clearly state the conditions for every output change (e.g., "The Solenoid Valve remains open ONLY as long as the pressure switch is active").
      6. **Safety & Reset:** Always include how the system should behave during an Emergency Stop or how to reset the process to the initial state.

      ### Output Requirements:
      You MUST respond ONLY with a valid JSON object. Do not include any conversational text, markdown code blocks, or preamble.

      The JSON structure must be:
      {
        "narrative": "Sajikan dalam bahasa Indonesia formal dengan struktur: 1) Paragraf Pendahuluan yang memperkenalkan sistem dan komponen utamanya secara mengalir sebagai pembuka cerita. 2) Daftar bernomor (numbered list) yang menjelaskan urutan operasi secara mendetail. JUMLAH STEP HARUS mendekati ${formData.stepCount} step. PENTING: Jaga konsistensi panjang setiap step; setiap nomor harus terdiri dari 2-3 kalimat deskriptif yang detail. Jika jumlah step yang diminta banyak, tingkatkan kompleksitas skenario industri tersebut agar soal menjadi lebih panjang secara proporsional tanpa mengurangi detail tiap stepnya. Alur harus mengikuti: Inisialisasi $\rightarrow$ Proses Utama (Trigger $\rightarrow$ Aksi $\rightarrow$ Konfirmasi) $\rightarrow$ Kondisi Steady-State (Saat aktif/menunggu) $\rightarrow$ Proses Pengakhiran (Selesai/Keluar) $\rightarrow$ Output Akhir, dan 7) Kondisi Reset. Gunakan teks tebal untuk komponen/sensor.",
        "io_table": [
          { "component": "Nama Komponen", "address": "Alamat I/O", "type": "Input/Output", "description": "Keterangan" }
        ],
        "flowchart_code": "The raw Mermaid.js graph TD code. STRICT RULES: 1) Start with 'graph TD'. 2) Define nodes simply as 'NodeID[Label]'. 3) Use only 'NodeID1 --> NodeID2' for transitions. 4) NEVER put node definitions inside a transition line (e.g., do NOT do 'A --> B[Label]'; instead do 'B[Label]' then 'A --> B'). 5) Avoid using special characters like brackets or quotes inside labels. 6) No markdown code blocks."
      }

      Ensure the problem is technically sound and feasible to be programmed on ${formData.plcHardware}.
    `;

    try {
      const response = await fetch(`${ENDPOINT}/models/${MODEL}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || `API Error: ${response.status} ${response.statusText}`);
      }

      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        let rawText = data.candidates[0].content.parts[0].text;
        
        // Clean potential markdown code blocks around JSON
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          rawText = jsonMatch[0];
        }

        try {
          const parsedData = JSON.parse(rawText);
          setResult({ data: parsedData });

          // Track Statistics
          const currentCount = parseInt(localStorage.getItem('stats_questions_generated') || '0');
          localStorage.setItem('stats_questions_generated', (currentCount + 1).toString());

          const usedCats = JSON.parse(localStorage.getItem('stats_categories_used') || '[]');
          if (!usedCats.includes(formData.plcHardware)) {
            usedCats.push(formData.plcHardware);
            localStorage.setItem('stats_categories_used', JSON.stringify(usedCats));
          }
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError, 'Raw text:', rawText);
          throw new Error('AI returned invalid JSON format. Please try again.');
        }
      } else {
        console.error('Unexpected API response structure:', data);
        throw new Error('Unexpected API response format. The AI might have blocked the content or returned an empty result.');
      }
    } catch (error) {
      setResult({ error: `Error generating question: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="generator-container">
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-5">
        <h1 className="generator-header">Question Generator</h1>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <form className="config-card" onSubmit={generateQuestion}>
            <div className="row">
              {/* Scenario Section */}
              <div className="col-12 form-group-custom">
                <label className="form-label-custom">Skenario / Deskripsi Soal</label>
                <textarea
                  className="form-control-custom"
                  name="scenario"
                  rows="3"
                  placeholder="Contoh: Sistem kontrol pengisian air otomatis dengan dua tangki..."
                  value={formData.scenario}
                  onChange={handleChange}
                />
              </div>

              {/* PLC Instructions Section */}
              <div className={`col-12 form-group-custom ${isInstrOpen ? 'active-dropdown-col' : ''}`}>
                <label className="form-label-custom">Instruksi PLC (Omron)</label>
                <div className="instr-selector-container">
                  <div
                    className={`instr-trigger ${formData.selectedInstructions.length > 0 ? 'has-value' : ''}`}
                    onClick={() => setIsInstrOpen(!isInstrOpen)}
                  >
                    <span className="instr-trigger-text">
                      {formData.selectedInstructions.length > 0
                        ? formData.selectedInstructions.join(', ')
                        : 'Pilih instruksi yang akan digunakan...'}
                    </span>
                    <span className={`arrow ${isInstrOpen ? 'up' : 'down'}`}></span>
                  </div>
                  {isInstrOpen && (
                    <div className="instr-dropdown">
                      <div className="instr-grid">
                        {OMRON_INSTRUCTIONS.map((instr) => (
                          <label key={instr.id} className="instr-checkbox-label">
                            <input
                              type="checkbox"
                              checked={formData.selectedInstructions.includes(instr.id)}
                              onChange={() => toggleInstruction(instr.id)}
                            />
                            <span className="checkbox-custom"></span>
                            {instr.label}
                          </label>
                        ))}
                      </div>
                      <div className="instr-footer">
                        <button
                          type="button"
                          className="btn-instr-done"
                          onClick={() => setIsInstrOpen(false)}
                        >
                          Selesai
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* I/O Section */}
              <div className="col-12">
                <div className="input-grid-3">
                  <NumberStepper
                    label="Jumlah Input (I/O)"
                    name="inputCount"
                    value={formData.inputCount}
                    onChange={(val) => setFormData(prev => ({ ...prev, inputCount: val }))}
                  />
                  <NumberStepper
                    label="Jumlah Output (I/O)"
                    name="outputCount"
                    value={formData.outputCount}
                    onChange={(val) => setFormData(prev => ({ ...prev, outputCount: val }))}
                  />
                  <NumberStepper
                    label="Jumlah Step Operasi"
                    name="stepCount"
                    value={formData.stepCount}
                    onChange={(val) => setFormData(prev => ({ ...prev, stepCount: val }))}
                  />
                </div>
              </div>
              {/* Operation & Branching Section */}
              <div className="col-12">
                <div className="input-grid">
                  <div className="form-group-custom">
                    <label className="form-label-custom">Mode Operasi</label>
                    <select
                      className="form-select-custom"
                      name="operationMode"
                      value={formData.operationMode}
                      onChange={handleChange}
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                      <option value="Semi-Automatic">Semi-Automatic</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="form-group-custom">
                    <label className="form-label-custom">Alur Percabangan</label>
                    <select
                      className="form-select-custom"
                      name="branchingFlow"
                      value={formData.branchingFlow}
                      onChange={handleChange}
                    >
                      <option value="Linear">Linear</option>
                      <option value="Branched">Branched</option>
                      <option value="Parallel">Parallel</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Hardware Section */}
              <div className="col-12 form-group-custom">
                <label className="form-label-custom">Hardware PLC</label>
                <select
                  className="form-select-custom"
                  name="plcHardware"
                  value={formData.plcHardware}
                  onChange={handleChange}
                >
                  <option value="Omron CP1E">Omron CP1E</option>
                  <option value="Omron CP1H">Omron CP1H</option>
                  <option value="Omron CP1L">Omron CP1L</option>
                  <option value="Omron CP2E">Omron CP2E</option>
                  <option value="Omron CJ1M">Omron CJ1M</option>
                  <option value="Omron CJ2M">Omron CJ2M</option>
                  <option value="Omron CJ2H">Omron CJ2H</option>
                  <option value="Omron NJ Series">Omron NJ Series</option>
                  <option value="Omron NX Series">Omron NX Series</option>
                </select>
              </div>

              {/* Custom Input Section */}
              <div className="col-12 form-group-custom">
                <label className="form-label-custom">Custom Input Text (Additional Requirements)</label>
                <textarea
                  className="form-control-custom"
                  name="customText"
                  rows="3"
                  placeholder="Tambahkan detail khusus lainnya di sini..."
                  value={formData.customText}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="btn-generate" disabled={isLoading}>
              {isLoading ? 'Generating with AI...' : 'Generate Professional Question'}
            </button>
          </form>

          {/* Output Result Section */}
          {(result || isLoading) && (
            <div 
              key={isLoading ? 'loading' : 'result'} 
              className="result-section mt-5 mb-5"
            >
              <div className="result-card">
                <div className="result-header">
                  <span className="result-badge">AI Generated Question</span>
                  <div className="result-actions">
                    <button className="btn-copy" onClick={() => {
                      navigator.clipboard.writeText(result?.text || '');
                      alert('Copied to clipboard!');
                    }}>Copy Text</button>
                    <button className="btn-save" onClick={handleSave}>Save Question</button>
                  </div>
                </div>
                <div className="result-body">
                  {isLoading ? (
                    <div className="loading-container">
                      <div className="spinner-ai"></div>
                      <p>Consulting PLC Expert AI...</p>
                    </div>
                  ) : result?.error ? (
                    <div className="error-container">
                      <p>{result.error}</p>
                    </div>
                  ) : (
                    <div className="ai-content">
                      {result?.data && (
                        <>
                          <div className="output-section mb-5">
                            <h3 className="section-title">Soal Narasi / Sequence of Operation</h3>
                            <MarkdownRenderer content={result.data.narrative} />
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
                                  {result.data.io_table.map((row, idx) => (
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
                            <Mermaid chart={result.data.flowchart_code} />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generator;
