// PCB data structure based on NintendoPCB folder
const pcbData = [
    {
        name: 'DMG-A02',
        hasKicad: true,
        hasImages: true,
        description: 'Game Boy main board revision A02'
    },
    {
        name: 'DMG-A03',
        hasKicad: false,
        hasImages: false,
        description: 'Game Boy main board revision A03'
    },
    {
        name: 'DMG-A06',
        hasKicad: false,
        hasImages: false,
        description: 'Game Boy main board revision A06'
    },
    {
        name: 'DMG-A07',
        hasKicad: false,
        hasImages: false,
        description: 'Game Boy main board revision A07'
    },
    {
        name: 'DMG-A08',
        hasKicad: false,
        hasImages: false,
        description: 'Game Boy main board revision A08'
    },
    {
        name: 'DMG-AAA',
        hasKicad: true,
        hasImages: true,
        description: 'Game Boy main board revision AAA'
    },
    {
        name: 'DMG-BEAN',
        hasKicad: false,
        hasImages: false,
        description: 'Game Boy BEAN revision'
    },
    {
        name: 'DMG-DECN',
        hasKicad: false,
        hasImages: false,
        description: 'Game Boy DECN revision'
    },
    {
        name: 'DMG-GDAN',
        hasKicad: true,
        hasImages: true,
        description: 'Game Boy GDAN revision'
    },
    {
        name: 'DMG-KFCN',
        hasKicad: false,
        hasImages: false,
        description: 'Game Boy KFCN revision'
    },
    {
        name: 'DMG-KFDN',
        hasKicad: false,
        hasImages: false,
        description: 'Game Boy KFDN revision'
    },
    {
        name: 'DMG-KGDU',
        hasKicad: true,
        hasImages: true,
        description: 'Game Boy KGDU revision'
    },
    {
        name: 'DMG-MHEU',
        hasKicad: false,
        hasImages: false,
        description: 'Game Boy MHEU revision'
    },
    {
        name: 'DMG-Z02',
        hasKicad: false,
        hasImages: false,
        description: 'Game Boy Z02 revision'
    },
    {
        name: 'DMG-Z03',
        hasKicad: false,
        hasImages: false,
        description: 'Game Boy Z03 revision'
    }
];

class PCBPortal {
    constructor() {
        this.currentPcbIndex = -1;
        this.filteredPcbs = [...pcbData];
        this.kicanvasInstance = null;
        
        this.initializeElements();
        this.bindEvents();
        this.populatePcbList();
    }
    
    initializeElements() {
        this.pcbList = document.getElementById('pcbList');
        this.searchInput = document.getElementById('search');
        this.currentPcbTitle = document.getElementById('currentPcb');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.frontScan = document.getElementById('frontScan');
        this.backScan = document.getElementById('backScan');
        this.frontNoImage = document.getElementById('frontNoImage');
        this.backNoImage = document.getElementById('backNoImage');
        this.kicanvas = document.getElementById('kicanvas');
        this.noKicad = document.getElementById('noKicad');
        this.boardInfo = document.getElementById('boardInfo');
    }
    
    bindEvents() {
        // Search functionality
        this.searchInput.addEventListener('input', (e) => {
            this.filterPcbs(e.target.value);
        });
        
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.navigatePcb(-1));
        this.nextBtn.addEventListener('click', () => this.navigatePcb(1));
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.navigatePcb(-1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.navigatePcb(1);
            }
        });
        
        // Image zoom on click
        this.frontScan.addEventListener('click', () => this.zoomImage(this.frontScan));
        this.backScan.addEventListener('click', () => this.zoomImage(this.backScan));
    }
    
    populatePcbList() {
        this.pcbList.innerHTML = '';
        
        this.filteredPcbs.forEach((pcb, index) => {
            const item = document.createElement('div');
            item.className = `pcb-item ${pcb.hasKicad ? 'has-kicad' : ''}`;
            item.innerHTML = `<span class="pcb-name">${pcb.name}</span>`;
            
            item.addEventListener('click', () => {
                this.selectPcb(index);
            });
            
            this.pcbList.appendChild(item);
        });
    }
    
    filterPcbs(searchTerm) {
        const term = searchTerm.toLowerCase();
        this.filteredPcbs = pcbData.filter(pcb => 
            pcb.name.toLowerCase().includes(term) ||
            pcb.description.toLowerCase().includes(term)
        );
        
        this.populatePcbList();
        
        // Reset selection if current PCB is filtered out
        if (this.currentPcbIndex >= 0) {
            const currentPcb = pcbData[this.currentPcbIndex];
            const newIndex = this.filteredPcbs.findIndex(p => p.name === currentPcb.name);
            if (newIndex === -1) {
                this.currentPcbIndex = -1;
                this.clearDisplay();
            } else {
                this.updateActiveItem(newIndex);
            }
        }
    }
    
    selectPcb(filteredIndex) {
        if (filteredIndex < 0 || filteredIndex >= this.filteredPcbs.length) return;
        
        const selectedPcb = this.filteredPcbs[filteredIndex];
        this.currentPcbIndex = pcbData.findIndex(p => p.name === selectedPcb.name);
        
        this.updateActiveItem(filteredIndex);
        this.loadPcbData(selectedPcb);
        this.updateNavigationButtons();
    }
    
    navigatePcb(direction) {
        if (this.filteredPcbs.length === 0) return;
        
        let newIndex;
        if (this.currentPcbIndex === -1) {
            newIndex = direction > 0 ? 0 : this.filteredPcbs.length - 1;
        } else {
            const currentPcb = pcbData[this.currentPcbIndex];
            const currentFilteredIndex = this.filteredPcbs.findIndex(p => p.name === currentPcb.name);
            newIndex = currentFilteredIndex + direction;
            
            if (newIndex < 0) newIndex = this.filteredPcbs.length - 1;
            if (newIndex >= this.filteredPcbs.length) newIndex = 0;
        }
        
        this.selectPcb(newIndex);
    }
    
    updateActiveItem(filteredIndex) {
        // Remove active class from all items
        document.querySelectorAll('.pcb-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected item
        const items = this.pcbList.children;
        if (items[filteredIndex]) {
            items[filteredIndex].classList.add('active');
        }
    }
    
    updateNavigationButtons() {
        const hasItems = this.filteredPcbs.length > 0;
        this.prevBtn.disabled = !hasItems;
        this.nextBtn.disabled = !hasItems;
    }
    
    loadPcbData(pcb) {
        this.currentPcbTitle.textContent = pcb.name;
        
        // Load scans
        this.loadImage(`NintendoPCB/${pcb.name}/scans/front.png`, this.frontScan, this.frontNoImage);
        this.loadImage(`NintendoPCB/${pcb.name}/scans/back.png`, this.backScan, this.backNoImage);
        
        // Load KiCad file
        this.loadKicadFile(pcb);
        
        // Update board info
        this.updateBoardInfo(pcb);
    }
    
    loadImage(src, imgElement, noImageElement) {
        imgElement.style.display = 'none';
        noImageElement.style.display = 'flex';
        
        const img = new Image();
        img.onload = () => {
            imgElement.src = src;
            imgElement.style.display = 'block';
            noImageElement.style.display = 'none';
        };
        img.onerror = () => {
            imgElement.style.display = 'none';
            noImageElement.style.display = 'flex';
        };
        img.src = src;
    }
    
    loadKicadFile(pcb) {
        // Reset KiCanvas
        this.clearKiCanvas();
        
        if (pcb.hasKicad) {
            const kicadPath = `NintendoPCB/${pcb.name}/${pcb.name}.kicad_pcb`;
            
            // Check if KiCad file exists
            fetch(kicadPath)
                .then(response => {
                    if (response.ok) {
                        // File exists, create new KiCanvas element
                        this.createKiCanvas(kicadPath);
                    } else {
                        throw new Error('KiCad file not found');
                    }
                })
                .catch(error => {
                    console.log('KiCad file not accessible:', error);
                    this.noKicad.style.display = 'flex';
                });
        } else {
            this.noKicad.style.display = 'flex';
        }
    }
    
    clearKiCanvas() {
        // Remove existing kicanvas-embed if it exists
        const existingCanvas = document.getElementById('kicanvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        this.noKicad.style.display = 'flex';
    }
    
    createKiCanvas(kicadPath) {
        // Create new kicanvas-embed element
        const kicanvasWrapper = document.querySelector('.kicad-wrapper');
        const newCanvas = document.createElement('kicanvas-embed');
        newCanvas.id = 'kicanvas';
        newCanvas.setAttribute('src', kicadPath);
        newCanvas.setAttribute('controls', 'basic');
        newCanvas.style.cssText = 'width: 100%; height: 100%; display: block;';
        
        // Insert before the no-kicad message
        kicanvasWrapper.insertBefore(newCanvas, this.noKicad);
        
        // Update reference and hide no-kicad message
        this.kicanvas = newCanvas;
        this.noKicad.style.display = 'none';
    }
    
    updateBoardInfo(pcb) {
        const hasKicadText = pcb.hasKicad ? 'Yes' : 'No';
        const hasImagesText = pcb.hasImages ? 'Yes' : 'No';
        
        this.boardInfo.innerHTML = `
            <p><strong>Board:</strong> ${pcb.name}</p>
            <p><strong>Description:</strong> ${pcb.description}</p>
            <p><strong>KiCad Design:</strong> ${hasKicadText}</p>
            <p><strong>Additional Images:</strong> ${hasImagesText}</p>
            <hr style="margin: 1rem 0; border: none; border-top: 1px solid #dee2e6;">
            <p><strong>Navigation:</strong></p>
            <p>• Use arrow keys or buttons to navigate</p>
            <p>• Click images to zoom</p>
            <p>• Search PCBs using the search box</p>
            <p>• ⚡ indicates boards with KiCad files</p>
        `;
    }
    
    clearDisplay() {
        this.currentPcbTitle.textContent = 'Select a PCB Model';
        this.frontScan.style.display = 'none';
        this.backScan.style.display = 'none';
        this.frontNoImage.style.display = 'flex';
        this.backNoImage.style.display = 'flex';
        this.kicanvas.style.display = 'none';
        this.noKicad.style.display = 'flex';
        this.boardInfo.innerHTML = '<p>Select a PCB to view details</p>';
        
        // Clear KiCanvas
        this.clearKiCanvas();
    }
    
    zoomImage(imgElement) {
        if (imgElement.style.display === 'none' || !imgElement.src) return;
        
        // Create modal for zoomed image
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            cursor: zoom-out;
        `;
        
        const zoomedImg = document.createElement('img');
        zoomedImg.src = imgElement.src;
        zoomedImg.style.cssText = `
            max-width: 95vw;
            max-height: 95vh;
            object-fit: contain;
        `;
        
        modal.appendChild(zoomedImg);
        document.body.appendChild(modal);
        
        modal.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    }
}

// Initialize the PCB Portal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PCBPortal();
});