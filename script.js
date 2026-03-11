// Material Database - SFM recommendations
const materialDatabase = {
    aluminum: {
        hss: { sfm: 300, chipLoad: 0.003 },
        carbide: { sfm: 800, chipLoad: 0.004 },
        coated: { sfm: 1000, chipLoad: 0.005 },
        ceramic: { sfm: 1200, chipLoad: 0.004 }
    },
    mild_steel: {
        hss: { sfm: 90, chipLoad: 0.002 },
        carbide: { sfm: 500, chipLoad: 0.003 },
        coated: { sfm: 650, chipLoad: 0.0035 },
        ceramic: { sfm: 800, chipLoad: 0.003 }
    },
    stainless: {
        hss: { sfm: 60, chipLoad: 0.0015 },
        carbide: { sfm: 350, chipLoad: 0.0025 },
        coated: { sfm: 450, chipLoad: 0.003 },
        ceramic: { sfm: 600, chipLoad: 0.0025 }
    },
    tool_steel: {
        hss: { sfm: 70, chipLoad: 0.0015 },
        carbide: { sfm: 400, chipLoad: 0.002 },
        coated: { sfm: 500, chipLoad: 0.0025 },
        ceramic: { sfm: 650, chipLoad: 0.002 }
    },
    titanium: {
        hss: { sfm: 40, chipLoad: 0.001 },
        carbide: { sfm: 250, chipLoad: 0.0015 },
        coated: { sfm: 350, chipLoad: 0.002 },
        ceramic: { sfm: 450, chipLoad: 0.0015 }
    },
    brass: {
        hss: { sfm: 200, chipLoad: 0.004 },
        carbide: { sfm: 600, chipLoad: 0.005 },
        coated: { sfm: 800, chipLoad: 0.006 },
        ceramic: { sfm: 1000, chipLoad: 0.005 }
    },
    plastic: {
        hss: { sfm: 500, chipLoad: 0.005 },
        carbide: { sfm: 1000, chipLoad: 0.006 },
        coated: { sfm: 1200, chipLoad: 0.007 },
        ceramic: { sfm: 1500, chipLoad: 0.006 }
    }
};

// Material specific cutting power constants (HP per cubic inch per minute)
const materialPowerConstants = {
    aluminum: 0.3,
    mild_steel: 0.8,
    stainless: 1.2,
    tool_steel: 1.4,
    titanium: 1.6,
    brass: 0.4,
    plastic: 0.2
};

// Lathe feed recommendations (inches per revolution)
const latheFeedDatabase = {
    aluminum: { roughing: 0.020, finishing: 0.005 },
    mild_steel: { roughing: 0.015, finishing: 0.003 },
    stainless: { roughing: 0.012, finishing: 0.003 },
    tool_steel: { roughing: 0.010, finishing: 0.002 },
    titanium: { roughing: 0.008, finishing: 0.002 },
    brass: { roughing: 0.020, finishing: 0.005 },
    plastic: { roughing: 0.025, finishing: 0.005 }
};

// Chip load ranges for different tool diameters (min, optimal, max)
const chipLoadRanges = {
    // Ranges based on tool diameter in inches
    small: { min: 0.0005, optimal: 0.001, max: 0.002 },   // < 0.125"
    medium: { min: 0.001, optimal: 0.003, max: 0.005 },   // 0.125" - 0.5"
    large: { min: 0.003, optimal: 0.006, max: 0.010 }     // > 0.5"
};

// Tapping speed recommendations (% of drilling speed)
const tapSpeedFactors = {
    aluminum: { hand: 0.5, spiral_point: 0.7, spiral_flute: 0.6, form: 0.4 },
    mild_steel: { hand: 0.3, spiral_point: 0.5, spiral_flute: 0.4, form: 0.3 },
    stainless: { hand: 0.2, spiral_point: 0.4, spiral_flute: 0.3, form: 0.25 },
    tool_steel: { hand: 0.2, spiral_point: 0.35, spiral_flute: 0.3, form: 0.2 },
    titanium: { hand: 0.15, spiral_point: 0.3, spiral_flute: 0.25, form: 0.15 },
    brass: { hand: 0.6, spiral_point: 0.8, spiral_flute: 0.7, form: 0.5 },
    plastic: { hand: 0.7, spiral_point: 0.9, spiral_flute: 0.8, form: 0.6 }
};

let currentMachineType = 'mill';
let customLibrary = [];

// Load custom library from localStorage
function loadCustomLibrary() {
    const saved = localStorage.getItem('customToolLibrary');
    if (saved) {
        customLibrary = JSON.parse(saved);
        renderCustomLibrary();
    }
}

// Save custom library to localStorage
function saveCustomLibrary() {
    localStorage.setItem('customToolLibrary', JSON.stringify(customLibrary));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCustomLibrary();
    setupEventListeners();
    updateUIForMachineType();
});

function setupEventListeners() {
    // Machine type buttons
    document.querySelectorAll('.machine-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.machine-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMachineType = btn.dataset.type;
            updateUIForMachineType();
        });
    });

    // Calculate button
    document.getElementById('calculateBtn').addEventListener('click', calculate);

    // Hint buttons
    document.getElementById('sfmHint').addEventListener('click', applySFMRecommendation);
    document.getElementById('chipLoadHint')?.addEventListener('click', applyChipLoadRecommendation);
    document.getElementById('feedPerRevHint')?.addEventListener('click', applyFeedPerRevRecommendation);

    // Save tool button
    document.getElementById('saveToolBtn').addEventListener('click', () => {
        document.getElementById('saveModal').style.display = 'block';
    });

    // Modal buttons
    document.getElementById('confirmSaveBtn').addEventListener('click', saveCurrentTool);
    document.getElementById('cancelSaveBtn').addEventListener('click', () => {
        document.getElementById('saveModal').style.display = 'none';
    });

    // Library buttons
    document.getElementById('saveLibraryBtn').addEventListener('click', exportLibrary);
    document.getElementById('loadLibraryBtn').addEventListener('click', importLibrary);

    // Tap size selector
    document.getElementById('tapSize').addEventListener('change', handleTapSizeChange);

    // Chip load checker - update on input
    document.getElementById('chipLoad')?.addEventListener('input', updateChipLoadIndicator);
    document.getElementById('toolDiameter')?.addEventListener('input', updateChipLoadIndicator);
}

function updateUIForMachineType() {
    const millDrillInputs = document.getElementById('millDrillInputs');
    const latheInputs = document.getElementById('latheInputs');
    const tapInputs = document.getElementById('tapInputs');
    const tapDrillResult = document.getElementById('tapDrillResult');

    // Hide all first
    millDrillInputs.style.display = 'none';
    latheInputs.style.display = 'none';
    tapInputs.style.display = 'none';
    tapDrillResult.style.display = 'none';

    if (currentMachineType === 'lathe') {
        latheInputs.style.display = 'block';
    } else if (currentMachineType === 'tap') {
        tapInputs.style.display = 'block';
        tapDrillResult.style.display = 'flex';
    } else {
        millDrillInputs.style.display = 'block';
        // Show chip load indicator for mill/drill
        updateChipLoadIndicator();
    }
}

function calculate() {
    let rpm, feedRate, mrr, power;

    const toolMaterial = document.getElementById('toolMaterial').value;
    const workMaterial = document.getElementById('workMaterial').value;
    const sfm = parseFloat(document.getElementById('sfm').value);
    const depthOfCut = parseFloat(document.getElementById('depthOfCut').value);
    const widthOfCut = parseFloat(document.getElementById('widthOfCut').value);

    if (currentMachineType === 'lathe') {
        const workDiameter = parseFloat(document.getElementById('workDiameter').value);
        const feedPerRev = parseFloat(document.getElementById('feedPerRev').value);

        // Calculate RPM: RPM = (SFM × 12) / (π × D)
        rpm = (sfm * 12) / (Math.PI * workDiameter);

        // Feed Rate: IPM = RPM × Feed/Rev
        feedRate = rpm * feedPerRev;

        // MRR for turning: MRR = 12 × RPM × Feed/Rev × Depth of Cut
        mrr = 12 * rpm * feedPerRev * depthOfCut;

    } else if (currentMachineType === 'tap') {
        // Tapping calculations
        const tapSizeSelect = document.getElementById('tapSize');
        let tapDiameter;
        
        if (tapSizeSelect.value === 'custom') {
            tapDiameter = parseFloat(document.getElementById('tapDiameter').value);
        } else {
            tapDiameter = parseFloat(tapSizeSelect.value.split(',')[0]);
        }
        
        const tpi = parseFloat(document.getElementById('tapPitch').value);
        const tapType = document.getElementById('tapType').value;
        const holeDepth = parseFloat(document.getElementById('holeDepth').value);

        // Get speed factor for material and tap type
        const speedFactor = tapSpeedFactors[workMaterial][tapType];

        // Calculate drilling RPM first
        const drillingRPM = (sfm * 12) / (Math.PI * tapDiameter);
        
        // Tapping RPM is a percentage of drilling RPM
        rpm = drillingRPM * speedFactor;

        // Feed Rate for tapping: IPM = RPM / TPI
        feedRate = rpm / tpi;

        // Calculate tap drill size (75% thread depth)
        const tapDrill = tapDiameter - (1.2990 / tpi);
        
        // Display tap drill size
        document.getElementById('tapDrillValue').textContent = `${tapDrill.toFixed(4)}"`;

        // Cycle time estimate (seconds)
        const cycleTime = (holeDepth / feedRate) * 60 * 2; // *2 for in and out
        mrr = 0; // Not applicable for tapping
        power = 0; // Minimal for tapping

    } else {
        // Mill or Drill
        const toolDiameter = parseFloat(document.getElementById('toolDiameter').value);
        const numFlutes = parseInt(document.getElementById('numFlutes').value);
        const chipLoad = parseFloat(document.getElementById('chipLoad').value);

        // Calculate RPM: RPM = (SFM × 12) / (π × D)
        rpm = (sfm * 12) / (Math.PI * toolDiameter);

        // Feed Rate: IPM = RPM × Flutes × Chip Load
        feedRate = rpm * numFlutes * chipLoad;

        // MRR: MRR = Feed Rate × Depth × Width
        mrr = feedRate * depthOfCut * widthOfCut;
    }

    // Calculate power requirement
    const powerConstant = materialPowerConstants[workMaterial] || 0.8;
    power = mrr * powerConstant;

    // Display results
    document.getElementById('rpmResult').textContent = `${Math.round(rpm)} RPM`;
    document.getElementById('feedRateResult').textContent = `${feedRate.toFixed(2)} IPM`;
    document.getElementById('mrrResult').textContent = currentMachineType === 'tap' ? 'N/A' : `${mrr.toFixed(3)} in³/min`;
    document.getElementById('powerResult').textContent = currentMachineType === 'tap' ? 'N/A' : `${power.toFixed(2)} HP`;
}

function applySFMRecommendation() {
    const toolMaterial = document.getElementById('toolMaterial').value;
    const workMaterial = document.getElementById('workMaterial').value;
    
    const recommended = materialDatabase[workMaterial][toolMaterial].sfm;
    document.getElementById('sfm').value = recommended;
}

function applyChipLoadRecommendation() {
    const toolMaterial = document.getElementById('toolMaterial').value;
    const workMaterial = document.getElementById('workMaterial').value;
    
    const recommended = materialDatabase[workMaterial][toolMaterial].chipLoad;
    document.getElementById('chipLoad').value = recommended.toFixed(4);
}

function applyFeedPerRevRecommendation() {
    const workMaterial = document.getElementById('workMaterial').value;
    const recommended = latheFeedDatabase[workMaterial].roughing;
    document.getElementById('feedPerRev').value = recommended.toFixed(3);
}

function saveCurrentTool() {
    const toolName = document.getElementById('toolName').value.trim();
    
    if (!toolName) {
        alert('Please enter a tool name');
        return;
    }

    const tool = {
        id: Date.now(),
        name: toolName,
        machineType: currentMachineType,
        toolMaterial: document.getElementById('toolMaterial').value,
        workMaterial: document.getElementById('workMaterial').value,
        sfm: document.getElementById('sfm').value,
        depthOfCut: document.getElementById('depthOfCut').value,
        widthOfCut: document.getElementById('widthOfCut').value
    };

    if (currentMachineType === 'lathe') {
        tool.workDiameter = document.getElementById('workDiameter').value;
        tool.feedPerRev = document.getElementById('feedPerRev').value;
    } else {
        tool.toolDiameter = document.getElementById('toolDiameter').value;
        tool.numFlutes = document.getElementById('numFlutes').value;
        tool.chipLoad = document.getElementById('chipLoad').value;
    }

    customLibrary.push(tool);
    saveCustomLibrary();
    renderCustomLibrary();

    document.getElementById('saveModal').style.display = 'none';
    document.getElementById('toolName').value = '';
}

function renderCustomLibrary() {
    const container = document.getElementById('customLibrary');
    
    if (customLibrary.length === 0) {
        container.innerHTML = '<p class="empty-state">No custom tools saved yet</p>';
        return;
    }

    container.innerHTML = customLibrary.map(tool => {
        const machineIcon = tool.machineType === 'mill' ? '⚙️' : 
                           tool.machineType === 'lathe' ? '🔧' : '🔩';
        
        let details = `${tool.toolMaterial.toUpperCase()} - ${formatMaterialName(tool.workMaterial)}`;
        if (tool.machineType === 'lathe') {
            details += ` | Ø${tool.workDiameter}" | ${tool.feedPerRev} IPR`;
        } else {
            details += ` | Ø${tool.toolDiameter}" | ${tool.numFlutes} flutes`;
        }

        return `
            <div class="tool-item">
                <div>
                    <h4>${machineIcon} ${tool.name}</h4>
                    <p>${details}</p>
                    <p>SFM: ${tool.sfm} | DOC: ${tool.depthOfCut}" | WOC: ${tool.widthOfCut}"</p>
                </div>
                <div class="tool-actions">
                    <button class="btn-small btn-load" onclick="loadTool(${tool.id})">Load</button>
                    <button class="btn-small btn-delete" onclick="deleteTool(${tool.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function formatMaterialName(material) {
    return material.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function loadTool(id) {
    const tool = customLibrary.find(t => t.id === id);
    if (!tool) return;

    // Switch to correct machine type
    currentMachineType = tool.machineType;
    document.querySelectorAll('.machine-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === tool.machineType);
    });
    updateUIForMachineType();

    // Load values
    document.getElementById('toolMaterial').value = tool.toolMaterial;
    document.getElementById('workMaterial').value = tool.workMaterial;
    document.getElementById('sfm').value = tool.sfm;
    document.getElementById('depthOfCut').value = tool.depthOfCut;
    document.getElementById('widthOfCut').value = tool.widthOfCut;

    if (tool.machineType === 'lathe') {
        document.getElementById('workDiameter').value = tool.workDiameter;
        document.getElementById('feedPerRev').value = tool.feedPerRev;
    } else {
        document.getElementById('toolDiameter').value = tool.toolDiameter;
        document.getElementById('numFlutes').value = tool.numFlutes;
        document.getElementById('chipLoad').value = tool.chipLoad;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteTool(id) {
    if (confirm('Are you sure you want to delete this tool?')) {
        customLibrary = customLibrary.filter(t => t.id !== id);
        saveCustomLibrary();
        renderCustomLibrary();
    }
}

function exportLibrary() {
    const dataStr = JSON.stringify(customLibrary, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `tool-library-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

function importLibrary() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (Array.isArray(imported)) {
                    if (confirm(`Import ${imported.length} tools? This will add to your current library.`)) {
                        customLibrary = [...customLibrary, ...imported];
                        saveCustomLibrary();
                        renderCustomLibrary();
                    }
                } else {
                    alert('Invalid library file format');
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Chip Load Indicator
function updateChipLoadIndicator() {
    if (currentMachineType !== 'mill' && currentMachineType !== 'drill') return;

    const chipLoad = parseFloat(document.getElementById('chipLoad').value);
    const toolDiameter = parseFloat(document.getElementById('toolDiameter').value);
    
    if (!chipLoad || !toolDiameter) return;

    // Determine range based on tool diameter
    let range;
    if (toolDiameter < 0.125) {
        range = chipLoadRanges.small;
    } else if (toolDiameter <= 0.5) {
        range = chipLoadRanges.medium;
    } else {
        range = chipLoadRanges.large;
    }

    const indicator = document.getElementById('chipLoadStatus');
    const fill = indicator.querySelector('.indicator-fill');
    const message = indicator.querySelector('.indicator-message');

    // Calculate position (0-100%)
    let position;
    let status;
    let messageText;

    if (chipLoad < range.min) {
        // Too light - rubbing
        position = (chipLoad / range.min) * 25; // 0-25%
        status = 'low';
        messageText = '⚠️ TOO LIGHT - Risk of rubbing and work hardening';
    } else if (chipLoad >= range.min && chipLoad <= range.optimal) {
        // Good range - lower half
        position = 25 + ((chipLoad - range.min) / (range.optimal - range.min)) * 25; // 25-50%
        status = 'good';
        messageText = '✓ GOOD - Optimal chip load range';
    } else if (chipLoad > range.optimal && chipLoad <= range.max) {
        // Good range - upper half
        position = 50 + ((chipLoad - range.optimal) / (range.max - range.optimal)) * 25; // 50-75%
        status = 'good';
        messageText = '✓ GOOD - Optimal chip load range';
    } else {
        // Too heavy - risk of breakage
        position = 75 + Math.min(((chipLoad - range.max) / range.max) * 25, 25); // 75-100%
        status = 'high';
        messageText = '⚠️ TOO HEAVY - Risk of tool breakage';
    }

    fill.style.width = `${position}%`;
    message.textContent = messageText;
    message.className = 'indicator-message status-' + status;
}

// Tap Size Handler
function handleTapSizeChange() {
    const tapSizeSelect = document.getElementById('tapSize');
    const customDiameterInput = document.getElementById('customTapDiameter');
    const tapPitchInput = document.getElementById('tapPitch');

    if (tapSizeSelect.value === 'custom') {
        customDiameterInput.style.display = 'block';
    } else {
        customDiameterInput.style.display = 'none';
        
        // Parse and set TPI from selection
        const [diameter, tpi] = tapSizeSelect.value.split(',');
        tapPitchInput.value = parseFloat(tpi).toFixed(3);
    }
}
