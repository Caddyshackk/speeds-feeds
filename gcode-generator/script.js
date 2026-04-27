// State
let currentMachine = 'mill';
let currentOperation = 'circle-pocket';
let generatedGCode = '';

// Parameter definitions for each operation
const operationParameters = {
    // Mill Operations
    'circle-pocket': [
        { id: 'diameter', label: 'Diameter (in)', type: 'number', value: 2.000, step: 0.125 },
        { id: 'totalDepth', label: 'Total Depth (in)', type: 'number', value: 0.500, step: 0.125 },
        { id: 'depthPerPass', label: 'Depth Per Pass (in)', type: 'number', value: 0.125, step: 0.025 },
        { id: 'toolDiameter', label: 'Tool Diameter (in)', type: 'number', value: 0.500, step: 0.125 },
        { id: 'feedRate', label: 'Feed Rate (IPM)', type: 'number', value: 20, step: 1 },
        { id: 'rpm', label: 'Spindle RPM', type: 'number', value: 2500, step: 100 },
        { id: 'centerX', label: 'Center X', type: 'number', value: 0, step: 0.125 },
        { id: 'centerY', label: 'Center Y', type: 'number', value: 0, step: 0.125 }
    ],
    'circle-profile': [
        { id: 'diameter', label: 'Diameter (in)', type: 'number', value: 2.000, step: 0.125 },
        { id: 'totalDepth', label: 'Total Depth (in)', type: 'number', value: 0.500, step: 0.125 },
        { id: 'depthPerPass', label: 'Depth Per Pass (in)', type: 'number', value: 0.125, step: 0.025 },
        { id: 'toolDiameter', label: 'Tool Diameter (in)', type: 'number', value: 0.500, step: 0.125 },
        { id: 'side', label: 'Cut Side', type: 'select', value: 'outside', options: [
            { value: 'outside', label: 'Outside' },
            { value: 'inside', label: 'Inside' }
        ]},
        { id: 'feedRate', label: 'Feed Rate (IPM)', type: 'number', value: 20, step: 1 },
        { id: 'rpm', label: 'Spindle RPM', type: 'number', value: 2500, step: 100 },
        { id: 'centerX', label: 'Center X', type: 'number', value: 0, step: 0.125 },
        { id: 'centerY', label: 'Center Y', type: 'number', value: 0, step: 0.125 }
    ],
    'rectangle-pocket': [
        { id: 'length', label: 'Length (in)', type: 'number', value: 4.000, step: 0.125 },
        { id: 'width', label: 'Width (in)', type: 'number', value: 2.000, step: 0.125 },
        { id: 'totalDepth', label: 'Total Depth (in)', type: 'number', value: 0.500, step: 0.125 },
        { id: 'depthPerPass', label: 'Depth Per Pass (in)', type: 'number', value: 0.125, step: 0.025 },
        { id: 'toolDiameter', label: 'Tool Diameter (in)', type: 'number', value: 0.500, step: 0.125 },
        { id: 'feedRate', label: 'Feed Rate (IPM)', type: 'number', value: 20, step: 1 },
        { id: 'rpm', label: 'Spindle RPM', type: 'number', value: 2500, step: 100 },
        { id: 'centerX', label: 'Center X', type: 'number', value: 0, step: 0.125 },
        { id: 'centerY', label: 'Center Y', type: 'number', value: 0, step: 0.125 }
    ],
    'rectangle-profile': [
        { id: 'length', label: 'Length (in)', type: 'number', value: 4.000, step: 0.125 },
        { id: 'width', label: 'Width (in)', type: 'number', value: 2.000, step: 0.125 },
        { id: 'totalDepth', label: 'Total Depth (in)', type: 'number', value: 0.500, step: 0.125 },
        { id: 'depthPerPass', label: 'Depth Per Pass (in)', type: 'number', value: 0.125, step: 0.025 },
        { id: 'toolDiameter', label: 'Tool Diameter (in)', type: 'number', value: 0.500, step: 0.125 },
        { id: 'side', label: 'Cut Side', type: 'select', value: 'outside', options: [
            { value: 'outside', label: 'Outside' },
            { value: 'inside', label: 'Inside' }
        ]},
        { id: 'feedRate', label: 'Feed Rate (IPM)', type: 'number', value: 20, step: 1 },
        { id: 'rpm', label: 'Spindle RPM', type: 'number', value: 2500, step: 100 },
        { id: 'centerX', label: 'Center X', type: 'number', value: 0, step: 0.125 },
        { id: 'centerY', label: 'Center Y', type: 'number', value: 0, step: 0.125 }
    ],
    'bolt-circle': [
        { id: 'boltCircleDia', label: 'Bolt Circle Diameter (in)', type: 'number', value: 3.000, step: 0.125 },
        { id: 'holeDiameter', label: 'Hole Diameter (in)', type: 'number', value: 0.375, step: 0.0625 },
        { id: 'numHoles', label: 'Number of Holes', type: 'number', value: 6, step: 1 },
        { id: 'startAngle', label: 'Start Angle (deg)', type: 'number', value: 0, step: 15 },
        { id: 'totalDepth', label: 'Total Depth (in)', type: 'number', value: 0.500, step: 0.125 },
        { id: 'peckDepth', label: 'Peck Depth (in)', type: 'number', value: 0.250, step: 0.125 },
        { id: 'feedRate', label: 'Feed Rate (IPM)', type: 'number', value: 10, step: 1 },
        { id: 'rpm', label: 'Spindle RPM', type: 'number', value: 2000, step: 100 },
        { id: 'centerX', label: 'Center X', type: 'number', value: 0, step: 0.125 },
        { id: 'centerY', label: 'Center Y', type: 'number', value: 0, step: 0.125 }
    ],
    'slot': [
        { id: 'length', label: 'Length (in)', type: 'number', value: 3.000, step: 0.125 },
        { id: 'width', label: 'Width (in)', type: 'number', value: 0.500, step: 0.125 },
        { id: 'totalDepth', label: 'Total Depth (in)', type: 'number', value: 0.500, step: 0.125 },
        { id: 'depthPerPass', label: 'Depth Per Pass (in)', type: 'number', value: 0.125, step: 0.025 },
        { id: 'toolDiameter', label: 'Tool Diameter (in)', type: 'number', value: 0.500, step: 0.125 },
        { id: 'feedRate', label: 'Feed Rate (IPM)', type: 'number', value: 20, step: 1 },
        { id: 'rpm', label: 'Spindle RPM', type: 'number', value: 2500, step: 100 },
        { id: 'centerX', label: 'Center X', type: 'number', value: 0, step: 0.125 },
        { id: 'centerY', label: 'Center Y', type: 'number', value: 0, step: 0.125 }
    ],
    
    // Lathe Operations
    'face': [
        { id: 'diameter', label: 'Stock Diameter (in)', type: 'number', value: 2.000, step: 0.125 },
        { id: 'totalDepth', label: 'Face Depth (in)', type: 'number', value: 0.125, step: 0.025 },
        { id: 'depthPerPass', label: 'Depth Per Pass (in)', type: 'number', value: 0.025, step: 0.005 },
        { id: 'feedRate', label: 'Feed Rate (IPR)', type: 'number', value: 0.010, step: 0.001 },
        { id: 'rpm', label: 'Spindle RPM', type: 'number', value: 1000, step: 100 }
    ],
    'turn-od': [
        { id: 'startDiameter', label: 'Start Diameter (in)', type: 'number', value: 2.000, step: 0.125 },
        { id: 'endDiameter', label: 'End Diameter (in)', type: 'number', value: 1.500, step: 0.125 },
        { id: 'length', label: 'Length (in)', type: 'number', value: 3.000, step: 0.125 },
        { id: 'depthPerPass', label: 'Depth Per Pass (in)', type: 'number', value: 0.050, step: 0.010 },
        { id: 'feedRate', label: 'Feed Rate (IPR)', type: 'number', value: 0.010, step: 0.001 },
        { id: 'rpm', label: 'Spindle RPM', type: 'number', value: 1000, step: 100 }
    ],
    'groove': [
        { id: 'diameter', label: 'Diameter (in)', type: 'number', value: 2.000, step: 0.125 },
        { id: 'grooveWidth', label: 'Groove Width (in)', type: 'number', value: 0.125, step: 0.0625 },
        { id: 'grooveDepth', label: 'Groove Depth (in)', type: 'number', value: 0.100, step: 0.025 },
        { id: 'zPosition', label: 'Z Position', type: 'number', value: -1.000, step: 0.125 },
        { id: 'feedRate', label: 'Feed Rate (IPR)', type: 'number', value: 0.005, step: 0.001 },
        { id: 'rpm', label: 'Spindle RPM', type: 'number', value: 800, step: 100 }
    ],
    'counterbore': [
        { id: 'boreDiameter', label: 'Bore Diameter (in)', type: 'number', value: 1.000, step: 0.125 },
        { id: 'boreDepth', label: 'Bore Depth (in)', type: 'number', value: 0.500, step: 0.125 },
        { id: 'depthPerPass', label: 'Depth Per Pass (in)', type: 'number', value: 0.050, step: 0.010 },
        { id: 'feedRate', label: 'Feed Rate (IPR)', type: 'number', value: 0.008, step: 0.001 },
        { id: 'rpm', label: 'Spindle RPM', type: 'number', value: 1200, step: 100 }
    ],
    'thread': [
        { id: 'majorDiameter', label: 'Major Diameter (in)', type: 'number', value: 0.500, step: 0.0625 },
        { id: 'tpi', label: 'Threads Per Inch', type: 'number', value: 13, step: 1 },
        { id: 'threadLength', label: 'Thread Length (in)', type: 'number', value: 1.000, step: 0.125 },
        { id: 'rpm', label: 'Spindle RPM', type: 'number', value: 300, step: 50 }
    ]
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderParameters();
    drawPreview();
});

function setupEventListeners() {
    // Machine type buttons
    document.querySelectorAll('.machine-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.machine-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMachine = btn.dataset.type;
            switchMachine();
        });
    });

    // Operation buttons
    document.querySelectorAll('.operation-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const container = btn.closest('.operation-grid');
            container.querySelectorAll('.operation-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentOperation = btn.dataset.operation;
            renderParameters();
            drawPreview();
        });
    });

    // Generate button
    document.getElementById('generateBtn').addEventListener('click', generateGCode);

    // Copy button
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);

    // Download button
    document.getElementById('downloadBtn').addEventListener('click', downloadGCode);
}

function switchMachine() {
    const millOps = document.getElementById('millOperations');
    const latheOps = document.getElementById('latheOperations');
    
    if (currentMachine === 'mill') {
        millOps.style.display = 'grid';
        latheOps.style.display = 'none';
        currentOperation = 'circle-pocket';
        millOps.querySelector('.operation-btn').classList.add('active');
    } else {
        millOps.style.display = 'none';
        latheOps.style.display = 'grid';
        currentOperation = 'face';
        latheOps.querySelector('.operation-btn').classList.add('active');
    }
    
    renderParameters();
    drawPreview();
}

function renderParameters() {
    const container = document.getElementById('parametersContainer');
    const params = operationParameters[currentOperation];
    
    container.innerHTML = params.map(param => {
        if (param.type === 'select') {
            return `
                <div class="input-group">
                    <label for="${param.id}">${param.label}</label>
                    <select id="${param.id}">
                        ${param.options.map(opt => 
                            `<option value="${opt.value}" ${opt.value === param.value ? 'selected' : ''}>${opt.label}</option>`
                        ).join('')}
                    </select>
                </div>
            `;
        } else {
            return `
                <div class="input-group">
                    <label for="${param.id}">${param.label}</label>
                    <input type="${param.type}" id="${param.id}" value="${param.value}" step="${param.step || 0.001}">
                </div>
            `;
        }
    }).join('');
    
    // Add input listeners for live preview
    container.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', drawPreview);
    });
}

function getParameterValues() {
    const params = operationParameters[currentOperation];
    const values = {};
    
    params.forEach(param => {
        const element = document.getElementById(param.id);
        if (element) {
            values[param.id] = param.type === 'number' ? parseFloat(element.value) : element.value;
        }
    });
    
    return values;
}

// G-Code Generation Functions
function generateGCode() {
    const params = getParameterValues();
    let gcode = '';
    
    // Header
    gcode += `(Generated by G-Code Generator)\n`;
    gcode += `(Operation: ${currentOperation.toUpperCase().replace('-', ' ')})\n`;
    gcode += `(Date: ${new Date().toLocaleString()})\n\n`;
    
    // Generate operation-specific code
    if (currentMachine === 'mill') {
        gcode += generateMillGCode(params);
    } else {
        gcode += generateLatheGCode(params);
    }
    
    generatedGCode = gcode;
    document.getElementById('gcodeDisplay').textContent = gcode;
    updateStats();
}

function generateMillGCode(params) {
    let gcode = '';
    
    // Setup
    gcode += `G90 G54 G17\n`; // Absolute, work offset, XY plane
    gcode += `G21\n`; // Metric (we'll convert)
    gcode += `M03 S${params.rpm}\n`; // Start spindle
    gcode += `G00 Z0.5\n\n`; // Rapid to safe height
    
    switch(currentOperation) {
        case 'circle-pocket':
            gcode += generateCirclePocket(params);
            break;
        case 'circle-profile':
            gcode += generateCircleProfile(params);
            break;
        case 'rectangle-pocket':
            gcode += generateRectanglePocket(params);
            break;
        case 'rectangle-profile':
            gcode += generateRectangleProfile(params);
            break;
        case 'bolt-circle':
            gcode += generateBoltCircle(params);
            break;
        case 'slot':
            gcode += generateSlot(params);
            break;
    }
    
    // Footer
    gcode += `\nG00 Z0.5\n`;
    gcode += `M05\n`; // Stop spindle
    gcode += `M30\n`; // Program end
    gcode += `%\n`;
    
    return gcode;
}

function generateCirclePocket(params) {
    let gcode = '';
    const { diameter, totalDepth, depthPerPass, toolDiameter, feedRate, centerX, centerY } = params;
    const radius = diameter / 2;
    const numPasses = Math.ceil(totalDepth / depthPerPass);
    
    for (let pass = 1; pass <= numPasses; pass++) {
        const depth = Math.min(pass * depthPerPass, totalDepth);
        gcode += `(Pass ${pass} - Depth: ${depth.toFixed(3)}")\n`;
        
        // Start at center
        gcode += `G00 X${centerX.toFixed(4)} Y${centerY.toFixed(4)}\n`;
        gcode += `G01 Z${(-depth).toFixed(4)} F${(feedRate / 2).toFixed(1)}\n`;
        
        // Spiral out
        const stepOver = toolDiameter * 0.5;
        let currentRadius = 0;
        
        while (currentRadius < radius - toolDiameter / 2) {
            currentRadius += stepOver;
            if (currentRadius > radius - toolDiameter / 2) {
                currentRadius = radius - toolDiameter / 2;
            }
            
            // Full circle at current radius
            gcode += `G03 X${(centerX + currentRadius).toFixed(4)} Y${centerY.toFixed(4)} I${currentRadius.toFixed(4)} J0 F${feedRate.toFixed(1)}\n`;
        }
        
        gcode += `G00 Z0.1\n\n`;
    }
    
    return gcode;
}

function generateCircleProfile(params) {
    let gcode = '';
    const { diameter, totalDepth, depthPerPass, toolDiameter, side, feedRate, centerX, centerY } = params;
    const radius = diameter / 2;
    const offset = side === 'outside' ? toolDiameter / 2 : -toolDiameter / 2;
    const cutRadius = radius + offset;
    const numPasses = Math.ceil(totalDepth / depthPerPass);
    
    for (let pass = 1; pass <= numPasses; pass++) {
        const depth = Math.min(pass * depthPerPass, totalDepth);
        gcode += `(Pass ${pass} - Depth: ${depth.toFixed(3)}")\n`;
        
        // Move to start point
        gcode += `G00 X${(centerX + cutRadius).toFixed(4)} Y${centerY.toFixed(4)}\n`;
        gcode += `G01 Z${(-depth).toFixed(4)} F${(feedRate / 2).toFixed(1)}\n`;
        
        // Cut full circle
        gcode += `G03 X${(centerX + cutRadius).toFixed(4)} Y${centerY.toFixed(4)} I${(-cutRadius).toFixed(4)} J0 F${feedRate.toFixed(1)}\n`;
        
        gcode += `G00 Z0.1\n\n`;
    }
    
    return gcode;
}

function generateRectanglePocket(params) {
    let gcode = '';
    const { length, width, totalDepth, depthPerPass, toolDiameter, feedRate, centerX, centerY } = params;
    const numPasses = Math.ceil(totalDepth / depthPerPass);
    
    for (let pass = 1; pass <= numPasses; pass++) {
        const depth = Math.min(pass * depthPerPass, totalDepth);
        gcode += `(Pass ${pass} - Depth: ${depth.toFixed(3)}")\n`;
        
        // Start at center
        gcode += `G00 X${centerX.toFixed(4)} Y${centerY.toFixed(4)}\n`;
        gcode += `G01 Z${(-depth).toFixed(4)} F${(feedRate / 2).toFixed(1)}\n`;
        
        // Spiral out in rectangles
        const stepOver = toolDiameter * 0.5;
        let currentLength = 0;
        let currentWidth = 0;
        
        while (currentLength < length - toolDiameter && currentWidth < width - toolDiameter) {
            currentLength += stepOver * 2;
            currentWidth += stepOver * 2;
            
            if (currentLength > length - toolDiameter) currentLength = length - toolDiameter;
            if (currentWidth > width - toolDiameter) currentWidth = width - toolDiameter;
            
            const halfL = currentLength / 2;
            const halfW = currentWidth / 2;
            
            gcode += `G01 X${(centerX + halfL).toFixed(4)} F${feedRate.toFixed(1)}\n`;
            gcode += `G01 Y${(centerY + halfW).toFixed(4)}\n`;
            gcode += `G01 X${(centerX - halfL).toFixed(4)}\n`;
            gcode += `G01 Y${(centerY - halfW).toFixed(4)}\n`;
            gcode += `G01 X${(centerX + halfL).toFixed(4)}\n`;
        }
        
        gcode += `G00 Z0.1\n\n`;
    }
    
    return gcode;
}

function generateRectangleProfile(params) {
    let gcode = '';
    const { length, width, totalDepth, depthPerPass, toolDiameter, side, feedRate, centerX, centerY } = params;
    const offset = side === 'outside' ? toolDiameter / 2 : -toolDiameter / 2;
    const cutLength = length + (offset * 2);
    const cutWidth = width + (offset * 2);
    const numPasses = Math.ceil(totalDepth / depthPerPass);
    
    for (let pass = 1; pass <= numPasses; pass++) {
        const depth = Math.min(pass * depthPerPass, totalDepth);
        gcode += `(Pass ${pass} - Depth: ${depth.toFixed(3)}")\n`;
        
        const halfL = cutLength / 2;
        const halfW = cutWidth / 2;
        
        // Move to start
        gcode += `G00 X${(centerX - halfL).toFixed(4)} Y${(centerY - halfW).toFixed(4)}\n`;
        gcode += `G01 Z${(-depth).toFixed(4)} F${(feedRate / 2).toFixed(1)}\n`;
        
        // Cut rectangle
        gcode += `G01 X${(centerX + halfL).toFixed(4)} F${feedRate.toFixed(1)}\n`;
        gcode += `G01 Y${(centerY + halfW).toFixed(4)}\n`;
        gcode += `G01 X${(centerX - halfL).toFixed(4)}\n`;
        gcode += `G01 Y${(centerY - halfW).toFixed(4)}\n`;
        
        gcode += `G00 Z0.1\n\n`;
    }
    
    return gcode;
}

function generateBoltCircle(params) {
    let gcode = '';
    const { boltCircleDia, holeDiameter, numHoles, startAngle, totalDepth, peckDepth, feedRate, rpm, centerX, centerY } = params;
    const radius = boltCircleDia / 2;
    const angleStep = 360 / numHoles;
    
    for (let i = 0; i < numHoles; i++) {
        const angle = (startAngle + (i * angleStep)) * Math.PI / 180;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        gcode += `(Hole ${i + 1} at ${x.toFixed(4)}, ${y.toFixed(4)})\n`;
        gcode += `G00 X${x.toFixed(4)} Y${y.toFixed(4)}\n`;
        gcode += `G00 Z0.1\n`;
        gcode += `G83 Z${(-totalDepth).toFixed(4)} R0.1 Q${peckDepth.toFixed(4)} F${feedRate.toFixed(1)}\n`;
        gcode += `G00 Z0.5\n\n`;
    }
    
    return gcode;
}

function generateSlot(params) {
    let gcode = '';
    const { length, width, totalDepth, depthPerPass, toolDiameter, feedRate, centerX, centerY } = params;
    const endRadius = width / 2;
    const straightLength = length - width;
    const numPasses = Math.ceil(totalDepth / depthPerPass);
    
    for (let pass = 1; pass <= numPasses; pass++) {
        const depth = Math.min(pass * depthPerPass, totalDepth);
        gcode += `(Pass ${pass} - Depth: ${depth.toFixed(3)}")\n`;
        
        const x1 = centerX - straightLength / 2;
        const x2 = centerX + straightLength / 2;
        
        // Start position
        gcode += `G00 X${x1.toFixed(4)} Y${centerY.toFixed(4)}\n`;
        gcode += `G01 Z${(-depth).toFixed(4)} F${(feedRate / 2).toFixed(1)}\n`;
        
        // Right semicircle
        gcode += `G03 X${x2.toFixed(4)} Y${(centerY + endRadius).toFixed(4)} I${(straightLength/2).toFixed(4)} J${endRadius.toFixed(4)} F${feedRate.toFixed(1)}\n`;
        gcode += `G03 X${x1.toFixed(4)} Y${centerY.toFixed(4)} I${(-straightLength/2).toFixed(4)} J${(-endRadius).toFixed(4)}\n`;
        
        gcode += `G00 Z0.1\n\n`;
    }
    
    return gcode;
}

function generateLatheGCode(params) {
    let gcode = '';
    
    // Setup for lathe
    gcode += `G90 G54\n`; // Absolute, work offset
    gcode += `G18\n`; // ZX plane
    gcode += `M03 S${params.rpm}\n`; // Start spindle
    gcode += `G00 X3.0 Z0.5\n\n`; // Rapid to safe position
    
    switch(currentOperation) {
        case 'face':
            gcode += generateFace(params);
            break;
        case 'turn-od':
            gcode += generateTurnOD(params);
            break;
        case 'groove':
            gcode += generateGroove(params);
            break;
        case 'counterbore':
            gcode += generateCounterbore(params);
            break;
        case 'thread':
            gcode += generateThread(params);
            break;
    }
    
    // Footer
    gcode += `\nG00 X3.0 Z0.5\n`;
    gcode += `M05\n`;
    gcode += `M30\n`;
    gcode += `%\n`;
    
    return gcode;
}

function generateFace(params) {
    let gcode = '';
    const { diameter, totalDepth, depthPerPass, feedRate, rpm } = params;
    const numPasses = Math.ceil(totalDepth / depthPerPass);
    
    for (let pass = 1; pass <= numPasses; pass++) {
        const depth = Math.min(pass * depthPerPass, totalDepth);
        gcode += `(Pass ${pass} - Z: ${(-depth).toFixed(4)})\n`;
        
        gcode += `G00 X${(diameter + 0.1).toFixed(4)} Z${(-depth).toFixed(4)}\n`;
        gcode += `G01 X-0.050 F${feedRate.toFixed(3)}\n`;
        gcode += `G00 Z0.1\n\n`;
    }
    
    return gcode;
}

function generateTurnOD(params) {
    let gcode = '';
    const { startDiameter, endDiameter, length, depthPerPass, feedRate } = params;
    const totalStock = (startDiameter - endDiameter) / 2;
    const numPasses = Math.ceil(totalStock / depthPerPass);
    
    for (let pass = 1; pass <= numPasses; pass++) {
        const currentDia = startDiameter - (Math.min(pass * depthPerPass, totalStock) * 2);
        gcode += `(Pass ${pass} - Diameter: ${currentDia.toFixed(4)})\n`;
        
        gcode += `G00 X${(currentDia + 0.1).toFixed(4)} Z0.1\n`;
        gcode += `G01 X${currentDia.toFixed(4)}\n`;
        gcode += `G01 Z${(-length).toFixed(4)} F${feedRate.toFixed(3)}\n`;
        gcode += `G00 X${(startDiameter + 0.5).toFixed(4)}\n`;
        gcode += `G00 Z0.1\n\n`;
    }
    
    return gcode;
}

function generateGroove(params) {
    let gcode = '';
    const { diameter, grooveWidth, grooveDepth, zPosition, feedRate } = params;
    const finalDia = diameter - (grooveDepth * 2);
    
    gcode += `(Groove at Z${zPosition.toFixed(4)})\n`;
    gcode += `G00 X${(diameter + 0.1).toFixed(4)} Z${(zPosition + 0.1).toFixed(4)}\n`;
    gcode += `G01 Z${zPosition.toFixed(4)} F${feedRate.toFixed(3)}\n`;
    gcode += `G01 X${finalDia.toFixed(4)}\n`;
    gcode += `G01 Z${(zPosition - grooveWidth).toFixed(4)}\n`;
    gcode += `G01 X${diameter.toFixed(4)}\n`;
    gcode += `G00 Z${(zPosition + 0.1).toFixed(4)}\n`;
    
    return gcode;
}

function generateCounterbore(params) {
    let gcode = '';
    const { boreDiameter, boreDepth, depthPerPass, feedRate } = params;
    const numPasses = Math.ceil(boreDepth / depthPerPass);
    
    for (let pass = 1; pass <= numPasses; pass++) {
        const depth = Math.min(pass * depthPerPass, boreDepth);
        gcode += `(Pass ${pass} - Depth: ${depth.toFixed(4)})\n`;
        
        gcode += `G00 X${(boreDiameter - 0.1).toFixed(4)} Z0.1\n`;
        gcode += `G01 Z${(-depth).toFixed(4)} F${feedRate.toFixed(3)}\n`;
        gcode += `G01 X${(boreDiameter + 0.1).toFixed(4)}\n`;
        gcode += `G00 Z0.1\n\n`;
    }
    
    return gcode;
}

function generateThread(params) {
    let gcode = '';
    const { majorDiameter, tpi, threadLength, rpm } = params;
    const pitch = 1 / tpi;
    
    gcode += `(Thread ${tpi} TPI on ${majorDiameter.toFixed(4)}" diameter)\n`;
    gcode += `G00 X${(majorDiameter + 0.1).toFixed(4)} Z0.1\n`;
    gcode += `G76 P${(pitch * 1000).toFixed(0)} Z${(-threadLength).toFixed(4)} I-${((majorDiameter - (0.649519 / tpi)) / 2).toFixed(4)} J${(pitch * 0.25).toFixed(4)} K${(pitch * 0.05).toFixed(4)} Q${(pitch * 0.2).toFixed(4)} R${(pitch * 0.05).toFixed(4)}\n`;
    
    return gcode;
}

// Preview Drawing
function drawPreview() {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const params = getParameterValues();
    
    // Clear canvas
    ctx.fillStyle = 'rgba(10, 22, 40, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set up coordinate system
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(1, -1); // Flip Y axis to match machining coordinates
    
    // Draw based on operation
    ctx.strokeStyle = '#5B9EFF';
    ctx.lineWidth = 3;
    
    const scale = Math.min(canvas.width, canvas.height) / 8; // Auto-scale
    
    switch(currentOperation) {
        case 'circle-pocket':
        case 'circle-profile':
            drawCircle(ctx, params, scale);
            break;
        case 'rectangle-pocket':
        case 'rectangle-profile':
            drawRectangle(ctx, params, scale);
            break;
        case 'bolt-circle':
            drawBoltCircle(ctx, params, scale);
            break;
        case 'slot':
            drawSlot(ctx, params, scale);
            break;
        case 'face':
        case 'turn-od':
        case 'groove':
        case 'counterbore':
        case 'thread':
            drawLathe(ctx, params, scale);
            break;
    }
    
    ctx.restore();
    
    // Draw axes
    drawAxes(ctx, canvas);
}

function drawCircle(ctx, params, scale) {
    const radius = (params.diameter / 2) * scale;
    const toolRadius = (params.toolDiameter / 2) * scale;
    
    // Draw workpiece
    ctx.fillStyle = 'rgba(91, 158, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw tool path
    ctx.strokeStyle = '#00D9FF';
    ctx.setLineDash([5, 5]);
    
    if (currentOperation === 'circle-pocket') {
        // Show spiral
        const stepOver = toolRadius;
        let currentRadius = 0;
        while (currentRadius < radius - toolRadius) {
            currentRadius += stepOver;
            ctx.beginPath();
            ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    } else {
        // Show profile cut
        const offset = params.side === 'outside' ? toolRadius : -toolRadius;
        ctx.beginPath();
        ctx.arc(0, 0, radius + offset, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawRectangle(ctx, params, scale) {
    const length = params.length * scale;
    const width = params.width * scale;
    const toolRadius = (params.toolDiameter / 2) * scale;
    
    // Draw workpiece
    ctx.fillStyle = 'rgba(91, 158, 255, 0.1)';
    ctx.fillRect(-length/2, -width/2, length, width);
    ctx.strokeRect(-length/2, -width/2, length, width);
    
    // Draw tool path
    ctx.strokeStyle = '#00D9FF';
    ctx.setLineDash([5, 5]);
    
    if (currentOperation === 'rectangle-pocket') {
        // Show stepped pockets
        const stepOver = toolRadius * 2;
        let offset = 0;
        while (offset < Math.min(length, width) / 2 - toolRadius) {
            offset += stepOver;
            const l = length - (offset * 2);
            const w = width - (offset * 2);
            if (l > 0 && w > 0) {
                ctx.strokeRect(-l/2, -w/2, l, w);
            }
        }
    } else {
        // Show profile cut
        const offset = params.side === 'outside' ? toolRadius : -toolRadius;
        const l = length + (offset * 2);
        const w = width + (offset * 2);
        ctx.strokeRect(-l/2, -w/2, l, w);
    }
}

function drawBoltCircle(ctx, params, scale) {
    const radius = (params.boltCircleDia / 2) * scale;
    const holeRadius = (params.holeDiameter / 2) * scale;
    
    // Draw bolt circle
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw holes
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(91, 158, 255, 0.3)';
    const angleStep = (2 * Math.PI) / params.numHoles;
    const startAngle = params.startAngle * Math.PI / 180;
    
    for (let i = 0; i < params.numHoles; i++) {
        const angle = startAngle + (i * angleStep);
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.arc(x, y, holeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}

function drawSlot(ctx, params, scale) {
    const length = params.length * scale;
    const width = params.width * scale;
    const radius = width / 2;
    const straightLength = length - width;
    
    // Draw slot
    ctx.fillStyle = 'rgba(91, 158, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(-straightLength/2, 0, radius, Math.PI/2, 3*Math.PI/2);
    ctx.arc(straightLength/2, 0, radius, -Math.PI/2, Math.PI/2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawLathe(ctx, params, scale) {
    // Draw lathe profile (simplified)
    ctx.strokeStyle = '#5B9EFF';
    ctx.fillStyle = 'rgba(91, 158, 255, 0.1)';
    
    switch(currentOperation) {
        case 'face':
            const dia = params.diameter * scale;
            ctx.fillRect(-150, -dia/2, 150, dia);
            ctx.strokeRect(-150, -dia/2, 150, dia);
            break;
            
        case 'turn-od':
            const startDia = params.startDiameter * scale;
            const endDia = params.endDiameter * scale;
            const len = params.length * scale;
            
            ctx.beginPath();
            ctx.moveTo(0, -startDia/2);
            ctx.lineTo(-len, -endDia/2);
            ctx.lineTo(-len, endDia/2);
            ctx.lineTo(0, startDia/2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'groove':
        case 'counterbore':
        case 'thread':
            const d = (params.diameter || params.boreDiameter || params.majorDiameter) * scale;
            ctx.fillRect(-150, -d/2, 150, d);
            ctx.strokeRect(-150, -d/2, 150, d);
            break;
    }
}

function drawAxes(ctx, canvas) {
    ctx.save();
    ctx.strokeStyle = 'rgba(91, 158, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    ctx.restore();
}

// Utility Functions
function copyToClipboard() {
    navigator.clipboard.writeText(generatedGCode).then(() => {
        const btn = document.getElementById('copyBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="icon">✓</span><span>Copied!</span>';
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    });
}

function downloadGCode() {
    const blob = new Blob([generatedGCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentOperation}_${new Date().getTime()}.nc`;
    a.click();
    URL.revokeObjectURL(url);
}

function updateStats() {
    const lines = generatedGCode.split('\n').filter(line => line.trim() && !line.startsWith('(')).length;
    const params = getParameterValues();
    
    document.getElementById('statLines').textContent = lines;
    document.getElementById('statDepth').textContent = (params.totalDepth || params.boreDepth || 0).toFixed(3) + '"';
    
    if (params.totalDepth && params.depthPerPass) {
        const passes = Math.ceil(params.totalDepth / params.depthPerPass);
        document.getElementById('statPasses').textContent = passes;
        
        // Estimate time (very rough)
        const minutes = Math.floor((passes * 30) / 60);
        const seconds = (passes * 30) % 60;
        document.getElementById('statTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}
