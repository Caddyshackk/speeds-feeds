// State
let currentMachine = 'mill';
let currentOperation = 'circle-pocket';
let generatedGCode = '';

// Parameter definitions for each operation with tool compensation
const operationParameters = {
    // Mill Operations
    'circle-pocket': [
        { id: 'diameter', label: 'Diameter (in)', type: 'number', value: 2.000, step: 0.125 },
        { id: 'totalDepth', label: 'Total Depth (in)', type: 'number', value: 0.500, step: 0.125 },
        { id: 'depthPerPass', label: 'Depth Per Pass (in)', type: 'number', value: 0.125, step: 0.025 },
        { id: 'toolDiameter', label: 'Tool Diameter (in)', type: 'number', value: 0.500, step: 0.125 },
        { id: 'toolType', label: 'Tool Type', type: 'select', value: 'flat', options: [
            { value: 'flat', label: 'Flat Endmill' },
            { value: 'ball', label: 'Ball Endmill' },
            { value: 'corner', label: 'Corner Radius' }
        ]},
        { id: 'cornerRadius', label: 'Corner/Ball Radius (in)', type: 'number', value: 0.0625, step: 0.0156, conditional: 'toolType:corner,ball' },
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
        { id: 'toolType', label: 'Tool Type', type: 'select', value: 'flat', options: [
            { value: 'flat', label: 'Flat Endmill' },
            { value: 'ball', label: 'Ball Endmill' },
            { value: 'corner', label: 'Corner Radius' }
        ]},
        { id: 'cornerRadius', label: 'Corner/Ball Radius (in)', type: 'number', value: 0.0625, step: 0.0156, conditional: 'toolType:corner,ball' },
        { id: 'side', label: 'Cut Side', type: 'select', value: 'outside', options: [
            { value: 'outside', label: 'Outside' },
            { value: 'inside', label: 'Inside' }
        ]},
        { id: 'useCompensation', label: 'Use G41/G42', type: 'select', value: 'yes', options: [
            { value: 'yes', label: 'Yes (Recommended)' },
            { value: 'no', label: 'No (Manual Offset)' }
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
        { id: 'toolType', label: 'Tool Type', type: 'select', value: 'flat', options: [
            { value: 'flat', label: 'Flat Endmill' },
            { value: 'ball', label: 'Ball Endmill' },
            { value: 'corner', label: 'Corner Radius' }
        ]},
        { id: 'cornerRadius', label: 'Corner/Ball Radius (in)', type: 'number', value: 0.0625, step: 0.0156, conditional: 'toolType:corner,ball' },
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
        { id: 'toolType', label: 'Tool Type', type: 'select', value: 'flat', options: [
            { value: 'flat', label: 'Flat Endmill' },
            { value: 'ball', label: 'Ball Endmill' },
            { value: 'corner', label: 'Corner Radius' }
        ]},
        { id: 'cornerRadius', label: 'Corner/Ball Radius (in)', type: 'number', value: 0.0625, step: 0.0156, conditional: 'toolType:corner,ball' },
        { id: 'side', label: 'Cut Side', type: 'select', value: 'outside', options: [
            { value: 'outside', label: 'Outside' },
            { value: 'inside', label: 'Inside' }
        ]},
        { id: 'useCompensation', label: 'Use G41/G42', type: 'select', value: 'yes', options: [
            { value: 'yes', label: 'Yes (Recommended)' },
            { value: 'no', label: 'No (Manual Offset)' }
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
    
    // Lathe Operations with nose radius
    'face': [
        { id: 'diameter', label: 'Stock Diameter (in)', type: 'number', value: 2.000, step: 0.125 },
        { id: 'totalDepth', label: 'Face Depth (in)', type: 'number', value: 0.125, step: 0.025 },
        { id: 'depthPerPass', label: 'Depth Per Pass (in)', type: 'number', value: 0.025, step: 0.005 },
        { id: 'noseRadius', label: 'Tool Nose Radius (in)', type: 'number', value: 0.031, step: 0.0156 },
        { id: 'useCompensation', label: 'Use G41/G42', type: 'select', value: 'yes', options: [
            { value: 'yes', label: 'Yes (Recommended)' },
            { value: 'no', label: 'No (Manual Offset)' }
        ]},
        { id: 'feedRate', label: 'Feed Rate (IPR)', type: 'number', value: 0.010, step: 0.001 },
        { id: 'rpm', label: 'Spindle RPM', type: 'number', value: 1000, step: 100 }
    ],
    'turn-od': [
        { id: 'startDiameter', label: 'Start Diameter (in)', type: 'number', value: 2.000, step: 0.125 },
        { id: 'endDiameter', label: 'End Diameter (in)', type: 'number', value: 1.500, step: 0.125 },
        { id: 'length', label: 'Length (in)', type: 'number', value: 3.000, step: 0.125 },
        { id: 'depthPerPass', label: 'Depth Per Pass (in)', type: 'number', value: 0.050, step: 0.010 },
        { id: 'noseRadius', label: 'Tool Nose Radius (in)', type: 'number', value: 0.031, step: 0.0156 },
        { id: 'useCompensation', label: 'Use G41/G42', type: 'select', value: 'yes', options: [
            { value: 'yes', label: 'Yes (Recommended)' },
            { value: 'no', label: 'No (Manual Offset)' }
        ]},
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
        { id: 'noseRadius', label: 'Tool Nose Radius (in)', type: 'number', value: 0.031, step: 0.0156 },
        { id: 'useCompensation', label: 'Use G41/G42', type: 'select', value: 'yes', options: [
            { value: 'yes', label: 'Yes (Recommended)' },
            { value: 'no', label: 'No (Manual Offset)' }
        ]},
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
    
    // Store current values before re-rendering
    const currentValues = {};
    params.forEach(param => {
        const element = document.getElementById(param.id);
        if (element) {
            currentValues[param.id] = element.value;
        }
    });
    
    container.innerHTML = params.map(param => {
        // Check conditional rendering
        if (param.conditional) {
            const [condField, condValues] = param.conditional.split(':');
            const condValue = currentValues[condField] || params.find(p => p.id === condField)?.value;
            if (!condValue || !condValues.split(',').includes(condValue)) {
                return '';
            }
        }
        
        const value = currentValues[param.id] || param.value;
        
        if (param.type === 'select') {
            return `
                <div class="input-group" data-param-id="${param.id}">
                    <label for="${param.id}">${param.label}</label>
                    <select id="${param.id}">
                        ${param.options.map(opt => 
                            `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`
                        ).join('')}
                    </select>
                </div>
            `;
        } else {
            return `
                <div class="input-group" data-param-id="${param.id}">
                    <label for="${param.id}">${param.label}</label>
                    <input type="${param.type}" id="${param.id}" value="${value}" step="${param.step || 0.001}">
                </div>
            `;
        }
    }).join('');
    
    // Add input listeners
    container.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', () => {
            renderParameters(); // Re-render for conditional fields
            drawPreview();
        });
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

// Tool Compensation Helper Functions
function calculateBallMillOffset(ballRadius, depth) {
    // For ball mills, calculate effective radius at given depth
    // Using Pythagorean theorem
    if (depth >= ballRadius) {
        return ballRadius; // Full tool engaged
    }
    const effectiveRadius = Math.sqrt(Math.pow(ballRadius, 2) - Math.pow(ballRadius - depth, 2));
    return effectiveRadius;
}

function calculateBallMillDepthAdjustment(ballRadius, targetDepth, radialOffset) {
    // Calculate Z depth adjustment for ball mills
    if (targetDepth >= ballRadius) {
        return targetDepth;
    }
    const zAdjust = ballRadius - Math.sqrt(Math.pow(ballRadius, 2) - Math.pow(radialOffset, 2));
    return targetDepth + zAdjust;
}

function getToolCompensation(params) {
    const toolType = params.toolType || 'flat';
    const toolRadius = params.toolDiameter / 2;
    const cornerRadius = params.cornerRadius || toolRadius;
    
    let offset = toolRadius;
    let depthAdjustment = 0;
    let useGCode = params.useCompensation === 'yes';
    
    if (toolType === 'ball') {
        const ballRadius = cornerRadius;
        if (params.totalDepth && params.totalDepth <= ballRadius) {
            offset = calculateBallMillOffset(ballRadius, params.totalDepth);
            depthAdjustment = calculateBallMillDepthAdjustment(ballRadius, params.totalDepth, offset);
        }
    }
    
    return { offset, depthAdjustment, useGCode, cornerRadius, toolType };
}

// G-Code Generation
function generateGCode() {
    const params = getParameterValues();
    let gcode = '';
    
    gcode += `(Generated by G-Code Generator)\n`;
    gcode += `(Operation: ${currentOperation.toUpperCase().replace('-', ' ')})\n`;
    gcode += `(Date: ${new Date().toLocaleString()})\n`;
    
    if (params.toolType) {
        gcode += `(Tool Type: ${params.toolType.toUpperCase()})\n`;
        if (params.toolType === 'ball' || params.toolType === 'corner') {
            gcode += `(Tool Radius: ${(params.cornerRadius || params.toolDiameter/2).toFixed(4)}")\n`;
        }
    }
    if (params.useCompensation) {
        gcode += `(Compensation: ${params.useCompensation === 'yes' ? 'G41/G42 ENABLED' : 'MANUAL OFFSET'})\n`;
    }
    gcode += `\n`;
    
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
    gcode += `G90 G54 G17\n`;
    gcode += `M03 S${params.rpm}\n`;
    gcode += `G00 Z0.5\n\n`;
    
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
    
    gcode += `\nG00 Z0.5\nM05\nM30\n%\n`;
    return gcode;
}

function generateCirclePocket(params) {
    let gcode = '';
    const { diameter, totalDepth, depthPerPass, toolDiameter, feedRate, centerX, centerY } = params;
    const comp = getToolCompensation(params);
    const radius = diameter / 2;
    const numPasses = Math.ceil(totalDepth / depthPerPass);
    
    for (let pass = 1; pass <= numPasses; pass++) {
        let depth = Math.min(pass * depthPerPass, totalDepth);
        if (comp.toolType === 'ball' && depth === totalDepth) {
            depth = comp.depthAdjustment;
        }
        
        gcode += `(Pass ${pass} - Depth: ${depth.toFixed(3)}")\n`;
        gcode += `G00 X${centerX.toFixed(4)} Y${centerY.toFixed(4)}\n`;
        gcode += `G01 Z${(-depth).toFixed(4)} F${(feedRate / 2).toFixed(1)}\n`;
        
        const stepOver = toolDiameter * 0.5;
        let currentRadius = 0;
        
        while (currentRadius < radius - toolDiameter / 2) {
            currentRadius += stepOver;
            if (currentRadius > radius - toolDiameter / 2) {
                currentRadius = radius - toolDiameter / 2;
            }
            gcode += `G03 X${(centerX + currentRadius).toFixed(4)} Y${centerY.toFixed(4)} I${currentRadius.toFixed(4)} J0 F${feedRate.toFixed(1)}\n`;
        }
        gcode += `G00 Z0.1\n\n`;
    }
    return gcode;
}

function generateCircleProfile(params) {
    let gcode = '';
    const { diameter, totalDepth, depthPerPass, side, feedRate, centerX, centerY } = params;
    const comp = getToolCompensation(params);
    const radius = diameter / 2;
    const offsetSign = side === 'outside' ? 1 : -1;
    const cutRadius = radius + (comp.offset * offsetSign);
    const numPasses = Math.ceil(totalDepth / depthPerPass);
    
    for (let pass = 1; pass <= numPasses; pass++) {
        let depth = Math.min(pass * depthPerPass, totalDepth);
        if (comp.toolType === 'ball' && depth === totalDepth) {
            depth = comp.depthAdjustment;
            gcode += `(Ball mill Z adjusted to ${depth.toFixed(4)}")\n`;
        }
        
        gcode += `(Pass ${pass} - Depth: ${depth.toFixed(3)}")\n`;
        
        if (comp.useGCode) {
            const compCode = side === 'outside' ? 'G41' : 'G42';
            gcode += `G00 X${(centerX + cutRadius - 0.1).toFixed(4)} Y${centerY.toFixed(4)}\n`;
            gcode += `G01 Z${(-depth).toFixed(4)} F${(feedRate / 2).toFixed(1)}\n`;
            gcode += `${compCode} D01\n`;
            gcode += `G01 X${(centerX + cutRadius).toFixed(4)} F${feedRate.toFixed(1)}\n`;
            gcode += `G03 X${(centerX + cutRadius).toFixed(4)} Y${centerY.toFixed(4)} I${(-cutRadius).toFixed(4)} J0\n`;
            gcode += `G40\n`;
        } else {
            gcode += `G00 X${(centerX + cutRadius).toFixed(4)} Y${centerY.toFixed(4)}\n`;
            gcode += `G01 Z${(-depth).toFixed(4)} F${(feedRate / 2).toFixed(1)}\n`;
            gcode += `G03 X${(centerX + cutRadius).toFixed(4)} Y${centerY.toFixed(4)} I${(-cutRadius).toFixed(4)} J0 F${feedRate.toFixed(1)}\n`;
        }
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
        gcode += `G00 X${centerX.toFixed(4)} Y${centerY.toFixed(4)}\n`;
        gcode += `G01 Z${(-depth).toFixed(4)} F${(feedRate / 2).toFixed(1)}\n`;
        
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
    const { length, width, totalDepth, depthPerPass, side, feedRate, centerX, centerY } = params;
    const comp = getToolCompensation(params);
    const offset = side === 'outside' ? comp.offset : -comp.offset;
    const cutLength = length + (offset * 2);
    const cutWidth = width + (offset * 2);
    const numPasses = Math.ceil(totalDepth / depthPerPass);
    
    for (let pass = 1; pass <= numPasses; pass++) {
        const depth = Math.min(pass * depthPerPass, totalDepth);
        gcode += `(Pass ${pass} - Depth: ${depth.toFixed(3)}")\n`;
        
        const halfL = cutLength / 2;
        const halfW = cutWidth / 2;
        
        if (comp.useGCode) {
            const compCode = side === 'outside' ? 'G41' : 'G42';
            gcode += `G00 X${(centerX - halfL - 0.1).toFixed(4)} Y${(centerY - halfW).toFixed(4)}\n`;
            gcode += `G01 Z${(-depth).toFixed(4)} F${(feedRate / 2).toFixed(1)}\n`;
            gcode += `${compCode} D01\n`;
            gcode += `G01 X${(centerX - halfL).toFixed(4)} F${feedRate.toFixed(1)}\n`;
            gcode += `G01 X${(centerX + halfL).toFixed(4)}\n`;
            gcode += `G01 Y${(centerY + halfW).toFixed(4)}\n`;
            gcode += `G01 X${(centerX - halfL).toFixed(4)}\n`;
            gcode += `G01 Y${(centerY - halfW).toFixed(4)}\n`;
            gcode += `G40\n`;
        } else {
            gcode += `G00 X${(centerX - halfL).toFixed(4)} Y${(centerY - halfW).toFixed(4)}\n`;
            gcode += `G01 Z${(-depth).toFixed(4)} F${(feedRate / 2).toFixed(1)}\n`;
            gcode += `G01 X${(centerX + halfL).toFixed(4)} F${feedRate.toFixed(1)}\n`;
            gcode += `G01 Y${(centerY + halfW).toFixed(4)}\n`;
            gcode += `G01 X${(centerX - halfL).toFixed(4)}\n`;
            gcode += `G01 Y${(centerY - halfW).toFixed(4)}\n`;
        }
        gcode += `G00 Z0.1\n\n`;
    }
    return gcode;
}

function generateBoltCircle(params) {
    let gcode = '';
    const { boltCircleDia, numHoles, startAngle, totalDepth, peckDepth, feedRate, centerX, centerY } = params;
    const radius = boltCircleDia / 2;
    const angleStep = 360 / numHoles;
    
    for (let i = 0; i < numHoles; i++) {
        const angle = (startAngle + (i * angleStep)) * Math.PI / 180;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        gcode += `(Hole ${i + 1})\n`;
        gcode += `G00 X${x.toFixed(4)} Y${y.toFixed(4)}\nG00 Z0.1\n`;
        gcode += `G83 Z${(-totalDepth).toFixed(4)} R0.1 Q${peckDepth.toFixed(4)} F${feedRate.toFixed(1)}\n`;
        gcode += `G00 Z0.5\n\n`;
    }
    return gcode;
}

function generateSlot(params) {
    let gcode = '';
    const { length, width, totalDepth, depthPerPass, feedRate, centerX, centerY } = params;
    const endRadius = width / 2;
    const straightLength = length - width;
    const numPasses = Math.ceil(totalDepth / depthPerPass);
    
    for (let pass = 1; pass <= numPasses; pass++) {
        const depth = Math.min(pass * depthPerPass, totalDepth);
        gcode += `(Pass ${pass})\n`;
        const x1 = centerX - straightLength / 2;
        const x2 = centerX + straightLength / 2;
        gcode += `G00 X${x1.toFixed(4)} Y${centerY.toFixed(4)}\n`;
        gcode += `G01 Z${(-depth).toFixed(4)} F${(feedRate / 2).toFixed(1)}\n`;
        gcode += `G03 X${x2.toFixed(4)} Y${(centerY + endRadius).toFixed(4)} I${(straightLength/2).toFixed(4)} J${endRadius.toFixed(4)} F${feedRate.toFixed(1)}\n`;
        gcode += `G03 X${x1.toFixed(4)} Y${centerY.toFixed(4)} I${(-straightLength/2).toFixed(4)} J${(-endRadius).toFixed(4)}\n`;
        gcode += `G00 Z0.1\n\n`;
    }
    return gcode;
}

function generateLatheGCode(params) {
    let gcode = '';
    gcode += `G90 G54 G18\n`;
    gcode += `M03 S${params.rpm}\n`;
    gcode += `G00 X3.0 Z0.5\n\n`;
    
    if (params.noseRadius && params.useCompensation === 'yes') {
        gcode += `(Tool Nose Radius: ${params.noseRadius.toFixed(4)}")\n`;
        gcode += `(Compensation ENABLED)\n\n`;
    }
    
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
    
    gcode += `\nG00 X3.0 Z0.5\nM05\nM30\n%\n`;
    return gcode;
}

function generateFace(params) {
    let gcode = '';
    const { diameter, totalDepth, depthPerPass, feedRate, useCompensation } = params;
    const numPasses = Math.ceil(totalDepth / depthPerPass);
    
    for (let pass = 1; pass <= numPasses; pass++) {
        const depth = Math.min(pass * depthPerPass, totalDepth);
        gcode += `(Pass ${pass})\n`;
        gcode += `G00 X${(diameter + 0.1).toFixed(4)} Z${(-depth).toFixed(4)}\n`;
        if (useCompensation === 'yes') gcode += `G42 D01\n`;
        gcode += `G01 X-0.050 F${feedRate.toFixed(3)}\n`;
        if (useCompensation === 'yes') gcode += `G40\n`;
        gcode += `G00 Z0.1\n\n`;
    }
    return gcode;
}

function generateTurnOD(params) {
    let gcode = '';
    const { startDiameter, endDiameter, length, depthPerPass, feedRate, useCompensation } = params;
    const totalStock = (startDiameter - endDiameter) / 2;
    const numPasses = Math.ceil(totalStock / depthPerPass);
    
    for (let pass = 1; pass <= numPasses; pass++) {
        const currentDia = startDiameter - (Math.min(pass * depthPerPass, totalStock) * 2);
        gcode += `(Pass ${pass} - Dia: ${currentDia.toFixed(4)}")\n`;
        gcode += `G00 X${(currentDia + 0.1).toFixed(4)} Z0.1\n`;
        if (useCompensation === 'yes') gcode += `G42 D01\n`;
        gcode += `G01 X${currentDia.toFixed(4)}\n`;
        gcode += `G01 Z${(-length).toFixed(4)} F${feedRate.toFixed(3)}\n`;
        if (useCompensation === 'yes') gcode += `G40\n`;
        gcode += `G00 X${(startDiameter + 0.5).toFixed(4)}\nG00 Z0.1\n\n`;
    }
    return gcode;
}

function generateGroove(params) {
    let gcode = '';
    const { diameter, grooveWidth, grooveDepth, zPosition, feedRate } = params;
    const finalDia = diameter - (grooveDepth * 2);
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
    const { boreDiameter, boreDepth, depthPerPass, feedRate, useCompensation } = params;
    const numPasses = Math.ceil(boreDepth / depthPerPass);
    
    for (let pass = 1; pass <= numPasses; pass++) {
        const depth = Math.min(pass * depthPerPass, boreDepth);
        gcode += `(Pass ${pass})\n`;
        gcode += `G00 X${(boreDiameter - 0.1).toFixed(4)} Z0.1\n`;
        if (useCompensation === 'yes') gcode += `G41 D01\n`;
        gcode += `G01 Z${(-depth).toFixed(4)} F${feedRate.toFixed(3)}\n`;
        gcode += `G01 X${(boreDiameter + 0.1).toFixed(4)}\n`;
        if (useCompensation === 'yes') gcode += `G40\n`;
        gcode += `G00 Z0.1\n\n`;
    }
    return gcode;
}

function generateThread(params) {
    let gcode = '';
    const { majorDiameter, tpi, threadLength } = params;
    const pitch = 1 / tpi;
    gcode += `G00 X${(majorDiameter + 0.1).toFixed(4)} Z0.1\n`;
    gcode += `G76 P${(pitch * 1000).toFixed(0)} Z${(-threadLength).toFixed(4)} I-${((majorDiameter - (0.649519 / tpi)) / 2).toFixed(4)} J${(pitch * 0.25).toFixed(4)} K${(pitch * 0.05).toFixed(4)} Q${(pitch * 0.2).toFixed(4)} R${(pitch * 0.05).toFixed(4)}\n`;
    return gcode;
}

// Preview Drawing
function drawPreview() {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const params = getParameterValues();
    
    ctx.fillStyle = 'rgba(10, 22, 40, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(1, -1);
    
    ctx.strokeStyle = '#5B9EFF';
    ctx.lineWidth = 3;
    
    const scale = Math.min(canvas.width, canvas.height) / 8;
    
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
    drawAxes(ctx, canvas);
}

function drawCircle(ctx, params, scale) {
    const radius = (params.diameter / 2) * scale;
    const comp = getToolCompensation(params);
    const toolRadius = (params.toolDiameter / 2) * scale;
    
    ctx.fillStyle = 'rgba(91, 158, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.strokeStyle = '#00D9FF';
    ctx.setLineDash([5, 5]);
    
    if (currentOperation === 'circle-pocket') {
        const stepOver = toolRadius;
        let currentRadius = 0;
        while (currentRadius < radius - toolRadius) {
            currentRadius += stepOver;
            ctx.beginPath();
            ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    } else {
        const offsetSign = params.side === 'outside' ? 1 : -1;
        const cutRadius = radius + (comp.offset * scale * offsetSign);
        ctx.beginPath();
        ctx.arc(0, 0, cutRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Show tool position for ball/corner mills
        if (comp.toolType === 'ball' || comp.toolType === 'corner') {
            ctx.setLineDash([]);
            ctx.strokeStyle = '#FFA502';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cutRadius, 0, toolRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

function drawRectangle(ctx, params, scale) {
    const length = params.length * scale;
    const width = params.width * scale;
    const comp = getToolCompensation(params);
    const toolRadius = (params.toolDiameter / 2) * scale;
    
    ctx.fillStyle = 'rgba(91, 158, 255, 0.1)';
    ctx.fillRect(-length/2, -width/2, length, width);
    ctx.strokeRect(-length/2, -width/2, length, width);
    
    ctx.strokeStyle = '#00D9FF';
    ctx.setLineDash([5, 5]);
    
    if (currentOperation === 'rectangle-pocket') {
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
        const offsetSign = params.side === 'outside' ? 1 : -1;
        const offset = comp.offset * scale * offsetSign;
        const l = length + (offset * 2);
        const w = width + (offset * 2);
        ctx.strokeRect(-l/2, -w/2, l, w);
        
        if (comp.toolType === 'ball' || comp.toolType === 'corner') {
            ctx.setLineDash([]);
            ctx.strokeStyle = '#FFA502';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(l/2, -w/2, toolRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

function drawBoltCircle(ctx, params, scale) {
    const radius = (params.boltCircleDia / 2) * scale;
    const holeRadius = (params.holeDiameter / 2) * scale;
    
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    
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
    
    ctx.fillStyle = 'rgba(91, 158, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(-straightLength/2, 0, radius, Math.PI/2, 3*Math.PI/2);
    ctx.arc(straightLength/2, 0, radius, -Math.PI/2, Math.PI/2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawLathe(ctx, params, scale) {
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
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
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
        const minutes = Math.floor((passes * 30) / 60);
        const seconds = (passes * 30) % 60;
        document.getElementById('statTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        document.getElementById('statPasses').textContent = '1';
        document.getElementById('statTime').textContent = '0:30';
    }
}
