document.addEventListener('DOMContentLoaded', function() {
    // Tool navigation
    const toolsGrid = document.getElementById('toolsGrid');
    const toolCards = document.querySelectorAll('.tool-card');
    const toolContainers = document.querySelectorAll('.tool-container');
    const backButtons = document.querySelectorAll('.back-btn');

    // Show tools grid initially
    toolsGrid.style.display = 'grid';
    toolContainers.forEach(container => container.style.display = 'none');

    // Tool card click event
    toolCards.forEach(card => {
        card.addEventListener('click', function() {
            const toolId = this.getAttribute('data-tool');
            toolsGrid.style.display = 'none';
            document.getElementById(`${toolId}Tool`).style.display = 'block';
        });
    });

    // Back button event
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            toolContainers.forEach(container => container.style.display = 'none');
            toolsGrid.style.display = 'grid';
        });
    });

    // JPG to PDF Converter functionality
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const convertBtn = document.getElementById('convertBtn');
    const clearBtn = document.getElementById('clearBtn');
    const imagePreview = document.getElementById('imagePreview');
    const loading = document.getElementById('loading');
    const successMessage = document.getElementById('successMessage');
    
    let images = [];
    
    // Event listeners for JPG to PDF
    browseBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', handleFileSelect);
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = '#f0f4ff';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.backgroundColor = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = '';
        
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });
    
    convertBtn.addEventListener('click', convertToPdf);
    
    clearBtn.addEventListener('click', clearAll);
    
    // Functions for JPG to PDF
    function handleFileSelect(e) {
        handleFiles(e.target.files);
        fileInput.value = '';
    }
    
    function handleFiles(files) {
        for (let file of files) {
            if (file.type.match('image/jpeg') || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    images.push({
                        name: file.name,
                        dataUrl: e.target.result
                    });
                    
                    updatePreview();
                    updateButtons();
                };
                
                reader.readAsDataURL(file);
            } else {
                alert('Please select only JPG/JPEG images.');
            }
        }
    }
    
    function updatePreview() {
        imagePreview.innerHTML = '';
        
        images.forEach((image, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            const img = document.createElement('img');
            img.src = image.dataUrl;
            img.alt = image.name;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                images.splice(index, 1);
                updatePreview();
                updateButtons();
            });
            
            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            imagePreview.appendChild(previewItem);
        });
    }
    
    function updateButtons() {
        convertBtn.disabled = images.length === 0;
        clearBtn.disabled = images.length === 0;
    }
    
    function clearAll() {
        images = [];
        updatePreview();
        updateButtons();
        successMessage.style.display = 'none';
    }
    
    function convertToPdf() {
        loading.style.display = 'block';
        successMessage.style.display = 'none';
        
        // Use setTimeout to allow the UI to update before the heavy processing
        setTimeout(() => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            images.forEach((image, index) => {
                if (index > 0) {
                    doc.addPage();
                }
                
                const imgProps = doc.getImageProperties(image.dataUrl);
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                
                const widthRatio = pageWidth / imgProps.width;
                const heightRatio = pageHeight / imgProps.height;
                const ratio = Math.min(widthRatio, heightRatio, 1);
                
                const width = imgProps.width * ratio;
                const height = imgProps.height * ratio;
                
                const x = (pageWidth - width) / 2;
                const y = (pageHeight - height) / 2;
                
                doc.addImage(image.dataUrl, 'JPEG', x, y, width, height);
            });
            
            doc.save('converted-images.pdf');
            
            loading.style.display = 'none';
            successMessage.style.display = 'block';
        }, 500);
    }

    
});