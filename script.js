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

    // Tap size selector and thread engagement slider
    document.getElementById('tapSize').addEventListener('change', () => {
        // Trigger slider to recalculate thread depth for new tap size
        const sliderEvent = new Event('input');
        document.getElementById('threadEngagement')?.dispatchEvent(sliderEvent);
    });
    document.getElementById('tapType').addEventListener('change', updateTapRecommendations);
    document.getElementById('threadEngagement')?.addEventListener('input', (e) => {
        const percentage = parseFloat(e.target.value);
        const tapSizeSelect = document.getElementById('tapSize');
        const threadDepthInput = document.getElementById('threadDepth');
        
        if (!tapSizeSelect || !threadDepthInput || !tapSizeSelect.value) return;
        
        const [tapDiameter, tpiOrPitch] = tapSizeSelect.value.split(',').map(parseFloat);
        
        // Calculate thread depth based on percentage
        // 50% = 0.5x diameter, 100% = 1.5x diameter
        const minDepth = tapDiameter * 0.5;
        const maxDepth = tapDiameter * 1.5;
        const threadDepth = minDepth + ((percentage - 50) / 50) * (maxDepth - minDepth);
        
        // Update the input and slider display
        threadDepthInput.value = threadDepth.toFixed(3);
        document.getElementById('threadEngagementValue').textContent = threadDepth.toFixed(3) + '"';
        
        updateTapRecommendations();
    });
    
    // Update tap info when material changes
    document.getElementById('workMaterial').addEventListener('change', () => {
        if (currentMachineType === 'tap') updateTapRecommendations();
    });

    // Chip load checker - update on input
    document.getElementById('chipLoad')?.addEventListener('input', updateChipLoadIndicator);
    document.getElementById('toolDiameter')?.addEventListener('input', updateChipLoadIndicator);
    
    // Feed per rev checker for lathe
    document.getElementById('feedPerRev')?.addEventListener('input', updateFeedPerRevIndicator);
}

function updateUIForMachineType() {
    const millDrillInputs = document.getElementById('millDrillInputs');
    const latheInputs = document.getElementById('latheInputs');
    const tapInputs = document.getElementById('tapInputs');
    const tapDrillResult = document.getElementById('tapDrillResult');
    
    // Elements to hide in tap mode
    const sfmGroup = document.getElementById('sfmGroup');
    const depthOfCutGroup = document.getElementById('depthOfCutGroup');
    const widthOfCutGroup = document.getElementById('widthOfCutGroup');

    // Hide all first
    millDrillInputs.style.display = 'none';
    latheInputs.style.display = 'none';
    tapInputs.style.display = 'none';
    if (tapDrillResult) tapDrillResult.style.display = 'none';

    if (currentMachineType === 'lathe') {
        latheInputs.style.display = 'block';
        if (sfmGroup) sfmGroup.style.display = 'flex';
        if (depthOfCutGroup) depthOfCutGroup.style.display = 'flex';
        if (widthOfCutGroup) widthOfCutGroup.style.display = 'flex';
        // Update feed per rev indicator
        updateFeedPerRevIndicator();
    } else if (currentMachineType === 'tap') {
        tapInputs.style.display = 'block';
        if (tapDrillResult) tapDrillResult.style.display = 'flex';
        // Hide SFM, DOC, WOC for tapping
        if (sfmGroup) sfmGroup.style.display = 'none';
        if (depthOfCutGroup) depthOfCutGroup.style.display = 'none';
        if (widthOfCutGroup) widthOfCutGroup.style.display = 'none';
        // Initialize thread depth from slider
        const threadEngagementSlider = document.getElementById('threadEngagement');
        if (threadEngagementSlider) {
            const sliderEvent = new Event('input');
            threadEngagementSlider.dispatchEvent(sliderEvent);
        }
        // Update tap recommendations immediately
        updateTapRecommendations();
    } else {
        millDrillInputs.style.display = 'block';
        if (sfmGroup) sfmGroup.style.display = 'flex';
        if (depthOfCutGroup) depthOfCutGroup.style.display = 'flex';
        if (widthOfCutGroup) widthOfCutGroup.style.display = 'flex';
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
        // Tapping - values are auto-calculated in updateTapRecommendations
        // No need to calculate here, just set dummy values so results don't show errors
        rpm = 0;
        feedRate = 0;
        mrr = 0;
        power = 0;
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
    document.getElementById('mrrResult').textContent = currentMachineType === 'tap' ? 'N/A' : `${mrr.toFixed(3)}`;
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

// Feed Per Rev Indicator (for Lathe)
function updateFeedPerRevIndicator() {
    if (currentMachineType !== 'lathe') return;

    const feedPerRev = parseFloat(document.getElementById('feedPerRev').value);
    const workMaterial = document.getElementById('workMaterial').value;
    
    if (!feedPerRev) return;

    // Get recommended ranges from database
    const recommended = latheFeedDatabase[workMaterial];
    
    // Define ranges: finishing (too light) -> roughing (good) -> too heavy
    const ranges = {
        min: recommended.finishing * 0.5,        // Below this is too fine
        finishingStart: recommended.finishing,   // Start of finishing range
        roughingStart: recommended.roughing * 0.7, // Start of roughing range  
        optimal: recommended.roughing,           // Optimal roughing
        max: recommended.roughing * 1.5          // Above this is too aggressive
    };

    const indicator = document.getElementById('feedPerRevStatus');
    if (!indicator) return;
    
    const fill = indicator.querySelector('.indicator-fill');
    const message = indicator.querySelector('.indicator-message');

    let position;
    let status;
    let messageText;

    if (feedPerRev < ranges.finishingStart) {
        // Too light - excessive cycle time
        position = (feedPerRev / ranges.finishingStart) * 25; // 0-25%
        status = 'low';
        messageText = '⚠️ TOO LIGHT - Very slow, excessive cycle time';
    } else if (feedPerRev >= ranges.finishingStart && feedPerRev < ranges.roughingStart) {
        // Finishing range
        position = 25 + ((feedPerRev - ranges.finishingStart) / (ranges.roughingStart - ranges.finishingStart)) * 25;
        status = 'good';
        messageText = '✓ FINISHING - Good for smooth surface finish';
    } else if (feedPerRev >= ranges.roughingStart && feedPerRev <= ranges.max) {
        // Roughing range
        position = 50 + ((feedPerRev - ranges.roughingStart) / (ranges.max - ranges.roughingStart)) * 25;
        status = 'good';
        messageText = '✓ ROUGHING - Good for material removal';
    } else {
        // Too heavy
        position = 75 + Math.min(((feedPerRev - ranges.max) / ranges.max) * 25, 25);
        status = 'high';
        messageText = '⚠️ TOO HEAVY - Risk of chatter and poor finish';
    }

    fill.style.width = `${position}%`;
    message.textContent = messageText;
    message.className = 'indicator-message status-' + status;
}

// Update Tap Recommendations (Auto-calculates everything)
function updateTapRecommendations() {
    console.log('updateTapRecommendations called');
    const tapSizeSelect = document.getElementById('tapSize');
    if (!tapSizeSelect || !tapSizeSelect.value) {
        console.log('No tap size selected');
        return;
    }
    
    const workMaterial = document.getElementById('workMaterial').value;
    const tapType = document.getElementById('tapType').value;
    const threadEngagement = parseFloat(document.getElementById('threadEngagement')?.value || 75);
    const threadDepth = parseFloat(document.getElementById('threadDepth')?.value || 0.5);
    
    console.log('Tap params:', {workMaterial, tapType, threadEngagement, threadDepth});
    
    const [tapDiameter, tpiOrPitch] = tapSizeSelect.value.split(',').map(parseFloat);
    
    // Determine if metric or imperial
    const isMetric = tpiOrPitch < 10; // Metric pitches are < 10
    let tpi;
    
    if (isMetric) {
        // Convert metric pitch to TPI: TPI = 25.4 / pitch
        tpi = 25.4 / tpiOrPitch;
    } else {
        tpi = tpiOrPitch;
    }
    
    // Calculate tap drill based on thread engagement percentage
    // Formula varies based on engagement
    let threadDepthConstant;
    if (threadEngagement <= 50) {
        threadDepthConstant = 1.299; // 50%
    } else if (threadEngagement >= 100) {
        threadDepthConstant = 0.6495; // 100%
    } else {
        threadDepthConstant = 0.9743; // 75% (standard)
    }
    
    const tapDrill = tapDiameter - (threadDepthConstant / tpi);
    
    // ALWAYS use 10 IPM feed rate for tapping (safe for all materials)
    const targetFeedRate = 10; // IPM
    
    // Calculate RPM from feed rate: RPM = Feed Rate × TPI
    const rpm = Math.round(targetFeedRate * tpi);
    
    // Feed rate is our constant target
    const feedRate = targetFeedRate;
    
    // Calculate cycle time (in and out): seconds
    const cycleTime = ((threadDepth / feedRate) * 60 * 2).toFixed(1);
    
    console.log('Calculated values:', {tapDrill, rpm, feedRate, cycleTime});
    
    // Update recommendation display - with safety checks
    const drillFraction = findClosestDrill(tapDrill);
    const recTapDrill = document.getElementById('recTapDrill');
    const recRPM = document.getElementById('recRPM');
    const recFeedRate = document.getElementById('recFeedRate');
    const recCycleTime = document.getElementById('recCycleTime');
    
    console.log('Elements found:', {recTapDrill, recRPM, recFeedRate, recCycleTime});
    
    if (recTapDrill) recTapDrill.textContent = `${drillFraction} (${tapDrill.toFixed(4)}")`;
    if (recRPM) recRPM.textContent = `${rpm} RPM`;
    if (recFeedRate) recFeedRate.textContent = `${feedRate.toFixed(2)} IPM`;
    if (recCycleTime) recCycleTime.textContent = 'N/A';
    
    console.log('Updated recommendations');
}

// Helper function to find closest drill size
function findClosestDrill(decimal) {
    // Common tap drill sizes
    const drillSizes = {
        0.0595: '#53',
        0.0635: '#52',
        0.0670: '#51',
        0.0700: '#50',
        0.0730: '#49',
        0.0760: '#48',
        0.0785: '#47',
        0.0810: '#46',
        0.0890: '#43',
        0.0935: '#42',
        0.0960: '#41',
        0.0980: '#40',
        0.1015: '#38',
        0.1040: '#37',
        0.1065: '#36',
        0.1094: '#35',
        0.1130: '#33',
        0.1160: '#32',
        0.1285: '#30',
        0.1360: '#29',
        0.1405: '#28',
        0.1470: '#26',
        0.1495: '#25',
        0.1520: '#24',
        0.1570: '#23',
        0.1610: '#21',
        0.1660: '#20',
        0.1695: '#18',
        0.1730: '#17',
        0.1770: '#16',
        0.1800: '#15',
        0.1850: '#14',
        0.1890: '#13',
        0.1910: '#12',
        0.1960: '#11',
        0.2010: '#7',
        0.2040: '#6',
        0.2055: '#5',
        0.2090: '#4',
        0.2130: '#3',
        0.2188: '7/32',
        0.2280: '#1',
        0.2344: '15/64',
        0.2460: 'B',
        0.2500: '1/4',
        0.2570: 'F',
        0.2656: '17/64',
        0.2720: 'I',
        0.2810: 'J',
        0.2812: '9/32',
        0.2900: 'K',
        0.2950: 'L',
        0.2969: 'J',
        0.3020: 'M',
        0.3125: '5/16',
        0.3160: 'P',
        0.3230: 'Q',
        0.3281: '21/64',
        0.3320: 'Q',
        0.3390: 'R',
        0.3438: '11/32',
        0.3465: 'S',
        0.3580: 'T',
        0.3594: '23/64',
        0.3680: 'U',
        0.3750: '3/8',
        0.3770: 'V',
        0.3860: 'W',
        0.3906: '25/64',
        0.3970: '25/64',
        0.4040: 'X',
        0.4062: '13/32',
        0.4130: 'Y',
        0.4219: '27/64',
        0.4375: '7/16',
        0.4531: '29/64',
        0.4688: '15/32',
        0.4844: '31/64',
        0.5000: '1/2',
        0.5156: '33/64',
        0.5312: '17/32',
        0.5469: '35/64',
        0.5625: '9/16',
        0.5781: '37/64',
        0.5938: '19/32',
        0.6094: '39/64',
        0.6250: '5/8',
        0.6406: '41/64',
        0.6562: '21/32',
        0.6719: '43/64',
        0.6875: '11/16',
        0.7031: '45/64',
        0.7188: '23/32',
        0.7344: '47/64',
        0.7500: '3/4',
        0.7656: '49/64',
        0.7812: '25/32',
        0.7969: '51/64',
        0.8125: '13/16',
        0.8281: '53/64',
        0.8438: '27/32',
        0.8594: '55/64',
        0.8750: '7/8',
        0.8906: '57/64',
        0.9062: '29/32',
        0.9219: '59/64',
        0.9375: '15/16',
        0.9531: '61/64',
        0.9688: '31/32',
        0.9844: '63/64',
        1.0000: '1'
    };

    let closest = 0;
    let closestName = '';
    let minDiff = 999;
    
    for (const [size, name] of Object.entries(drillSizes)) {
        const diff = Math.abs(parseFloat(size) - decimal);
        if (diff < minDiff) {
            minDiff = diff;
            closest = parseFloat(size);
            closestName = name;
        }
    }
    
    return closestName || decimal.toFixed(4) + '"';
}