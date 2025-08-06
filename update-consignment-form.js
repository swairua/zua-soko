const fs = require('fs');

// Read the current FarmerDashboard.tsx file
const filePath = './frontend/src/pages/farmer/FarmerDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Update imports to include Upload and Image icons
const importsToAdd = `  Upload,
  Image as ImageIcon,
  Trash2,`;

content = content.replace(
  '  CreditCard,\n} from "lucide-react";',
  `  CreditCard,\n${importsToAdd}\n} from "lucide-react";`
);

// Update formData state initialization
content = content.replace(
  `  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Vegetables",
    quantity: "",
    unit: "kg",
    bidPricePerUnit: "",
    location: "",
    harvestDate: "",
    expiryDate: "",
    images: [""],
  });`,
  `  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Vegetables",
    quantity: "",
    unit: "kg",
    bidPricePerUnit: "",
    location: "",
    harvestDate: "",
    expiryDate: "",
    images: [],
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);`
);

// Update the API call to use correct token and endpoint
content = content.replace(
  `    try {
      const token = localStorage.getItem("token");
      await axios.post(
        \`\${import.meta.env.VITE_API_URL}/consignments\`,
        {
          ...formData,
          quantity: parseFloat(formData.quantity),
          bidPricePerUnit: parseFloat(formData.bidPricePerUnit),
        },
        { headers: { Authorization: \`Bearer \${token}\` } },
      );`,
  `    try {
      const token = localStorage.getItem("authToken");
      
      // Convert images to base64 if any files selected
      const imageUrls = [];
      for (const file of selectedImages) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        imageUrls.push(base64);
      }
      
      const payload = {
        product_name: formData.title,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        price_per_unit: parseFloat(formData.bidPricePerUnit),
        notes: formData.description,
        location: formData.location,
        harvest_date: formData.harvestDate,
        expiry_date: formData.expiryDate,
        images: imageUrls,
      };
      
      await axios.post("/api/consignments", payload, {
        headers: { Authorization: \`Bearer \${token}\` }
      });`
);

// Update form reset to include new image state
content = content.replace(
  `      setFormData({
        title: "",
        description: "",
        category: "Vegetables",
        quantity: "",
        unit: "kg",
        bidPricePerUnit: "",
        location: "",
        harvestDate: "",
        expiryDate: "",
        images: [""],
      });`,
  `      setFormData({
        title: "",
        description: "",
        category: "Vegetables",
        quantity: "",
        unit: "kg",
        bidPricePerUnit: "",
        location: "",
        harvestDate: "",
        expiryDate: "",
        images: [],
      });
      setSelectedImages([]);
      setImagePreviews([]);`
);

// Add image handling functions before the return statement
const imageHandlingFunctions = `
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Validate file size (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Each image must be less than 5MB");
      return;
    }

    // Validate file type
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      toast.error("Only image files are allowed");
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
`;

content = content.replace(
  '  return (',
  imageHandlingFunctions + '\n  return ('
);

// Replace the Image URL section with proper file upload
const newImageUploadSection = `              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images (Optional)
                </label>
                <div className="space-y-4">
                  {/* Upload Button */}
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <Upload className="w-4 h-4 mr-2" />
                        Add Images
                      </div>
                    </label>
                    <span className="text-sm text-gray-500">
                      Max 5 images, 5MB each
                    </span>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={\`Preview \${index + 1}\`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {imagePreviews.length === 0 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No images uploaded yet</p>
                      <p className="text-sm text-gray-400">Images help buyers see your produce quality</p>
                    </div>
                  )}
                </div>
              </div>`;

content = content.replace(
  /              <div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">\s*Image URL\s*<\/label>[\s\S]*?<\/div>/,
  newImageUploadSection
);

// Write the updated content back to the file
fs.writeFileSync(filePath, content);

console.log('✅ FarmerDashboard.tsx updated with image upload functionality');
