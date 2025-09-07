import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import BackToDashboard from "../../components/BackToDashboard";
import CenterSelect from "../../components/CenterSelect";
import GradeSelect from '../../components/GradeSelect';
import Title from '../../components/Title';
import { useCreateStudent, useCheckStudentId } from '../../lib/api/students';


export default function AddStudent() {
  const containerRef = useRef(null);
  const [form, setForm] = useState({
    id: "",
    name: "",
    age: "",
    grade: "",
    school: "",
    phone: "",
    parentsPhone: "",
    main_center: "",
  });
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // Separate state for success message text
  const [newId, setNewId] = useState("");
  const [showQRButton, setShowQRButton] = useState(false);
  const [error, setError] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null); // 'grade', 'center', or null
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-hide success message text after 5 seconds, but keep success state for buttons
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpenDropdown(null);
        // Also blur any focused input to close browser autocomplete
        if (document.activeElement && document.activeElement.tagName === 'INPUT') {
          document.activeElement.blur();
        }
      }
    };

    // Also handle when a dropdown opens to close others
    const handleDropdownOpen = () => {
      // Close any open dropdowns when a new one opens
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('focusin', handleDropdownOpen);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('focusin', handleDropdownOpen);
    };
  }, [openDropdown]);
  const router = useRouter();
  
  // React Query hooks
  const createStudentMutation = useCreateStudent();
  const studentIdCheck = useCheckStudentId(form.id);

  const handleChange = (e) => {
    // Reset QR button if user starts entering new data (when form was previously empty)
    if (showQRButton && !form.id && !form.name && !form.age && !form.grade && !form.school && !form.phone && !form.parentsPhone && !form.main_center) {
      setShowQRButton(false);
      setNewId("");
    }
    
    // For ID field, only allow numbers
    if (e.target.name === 'id') {
      const value = e.target.value;
      // Only allow digits (0-9) and empty string
      if (value === '' || /^\d+$/.test(value)) {
        setForm({ ...form, [e.target.name]: value });
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    // Validate ID field
    if (!form.id || form.id.trim() === '') {
      setError("Student ID is required.");
      return;
    }
    
    // Ensure ID is a positive number
    const idNumber = parseInt(form.id);
    if (isNaN(idNumber) || idNumber <= 0) {
      setError("Student ID must be a positive number.");
      return;
    }
    
    // Check if student ID already exists
    if (studentIdCheck.data && studentIdCheck.data.exists) {
      setError("Student ID already exists. Please choose a different ID.");
      return;
    }
    
    // Validate phone numbers
    const studentPhone = form.phone;
    const parentPhone = form.parentsPhone;
    
    // Check if phone numbers are exactly 11 digits
    if (studentPhone.length !== 11) {
      setError("Student phone number must be exactly 11 digits");
      return;
    }
    
    if (parentPhone.length !== 11) {
      setError("Parent's phone number must be exactly 11 digits");
      return;
    }
    
    // Check if student phone number is the same as parent phone number
    if (studentPhone === parentPhone) {
      setError("Student phone number cannot be the same as parent phone number");
      return;
    }
    
    // Map parentsPhone to parents_phone for backend - preserve leading zeros by storing as strings
    const payload = { ...form, parents_phone: parentPhone };
    // Handle age - set to null if empty, otherwise convert to number
    payload.age = form.age && form.age.trim() !== '' ? Number(form.age) : null;
    payload.phone = studentPhone; // Keep as string to preserve leading zeros exactly
    let gradeClean = payload.grade.toLowerCase().replace(/\./g, '');
    payload.grade = gradeClean;
    delete payload.parentsPhone;
    
    // Ensure the custom ID is properly included and formatted
    if (form.id && form.id.trim() !== '') {
      payload.id = form.id.trim();
    }
    
    // Debug: Log the payload being sent
    console.log('📤 Sending student data to backend:', payload);
    
    createStudentMutation.mutate(payload, {
      onSuccess: (data) => {
        console.log('📥 Backend response:', data);
        console.log('🎯 Expected ID:', form.id, '| Received ID:', data.id);
        setSuccess(true);
        // Use the custom ID that user entered, not the auto-generated one from backend
        const displayId = form.id || data.id;
        setSuccessMessage(`✅ Student added successfully! ID: ${displayId}`); // Set success message with custom ID
        setNewId(displayId); // Use custom ID for QR generation
        setShowQRButton(true); // Show QR button after successful submission
      },
      onError: (err) => {
        setError(err.response?.data?.error || err.message);
      }
    });
  };

  const handleCreateQR = () => {
    if (newId) {
      // Use the custom ID that user entered for QR generation
      const qrId = form.id || newId;
      router.push(`/dashboard/qr_generator?mode=single&id=${qrId}`);
    }
  };

  const handleAddAnotherStudent = () => {
    setForm({
      id: "",
      name: "",
      age: "",
      grade: "",
      school: "",
      phone: "",
      parentsPhone: "",
      main_center: "",
    });
    setSuccess(false);
    setSuccessMessage(""); // Clear success message
    setNewId("");
    setShowQRButton(false);
    setError("");
  };

  const goBack = () => {
    router.push("/dashboard");
  };

  return (
    <div style={{ padding: "20px 5px 20px 5px" }}>
      <div ref={containerRef} style={{ maxWidth: 600, margin: "40px auto", padding: 24 }}>
        <style jsx>{`
          .title {
            font-size: 2rem;
            font-weight: 700;
            color: #ffffff;
            text-align: center;
            margin-bottom: 32px;
          }
          .form-container {
            background: white;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.2);
          }
          .form-group {
            margin-bottom: 24px;
          }
          .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #495057;
            font-size: 0.95rem;
          }
          .form-input {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s ease;
            box-sizing: border-box;
            background: #ffffff;
            color: #000000;
          }
          .form-input:focus {
            outline: none;
            border-color: #87CEEB;
            background: white;
            box-shadow: 0 0 0 3px rgba(135, 206, 235, 0.1);
          }
          .form-input::placeholder {
            color: #adb5bd;
          }
          .submit-btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 16px rgba(135, 206, 235, 0.3);
            margin-top: 8px;
          }
          .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(135, 206, 235, 0.4);
          }
          .success-message {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            border-radius: 10px;
            padding: 16px;
            margin-top: 16px;
            text-align: center;
            font-weight: 600;
            box-shadow: 0 4px 16px rgba(40, 167, 69, 0.3);
          }
          .error-message {
            background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%);
            color: white;
            border-radius: 10px;
            padding: 16px;
            margin-top: 16px;
            text-align: center;
            font-weight: 600;
            box-shadow: 0 4px 16px rgba(220, 53, 69, 0.3);
          }
          .id-feedback {
            margin-top: 8px;
            font-size: 0.9rem;
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: 500;
          }
          .id-feedback.checking {
            background: #f8f9fa;
            color: #6c757d;
            border: 1px solid #dee2e6;
          }
          .id-feedback.taken {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }
          .id-feedback.available {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
          }
          .error-border {
            border-color: #dc3545 !important;
            box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
          }
        `}</style>
        <Title>Add Student</Title>
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Student ID <span style={{color: 'red'}}>*</span></label>
              <input
                className={`form-input ${!studentIdCheck.isLoading && studentIdCheck.data && studentIdCheck.data.exists ? 'error-border' : ''}`}
                name="id"
                type="number"
                placeholder="Enter student ID"
                value={form.id}
                onChange={handleChange}
                required
                autocomplete="off"
                min="1"
                step="1"
              />
              {/* Student ID availability feedback */}
              {form.id && (
                <div>
                  {studentIdCheck.isLoading && (
                    <div className="id-feedback checking">
                      🔍 Checking availability...
                    </div>
                  )}
                  {!studentIdCheck.isLoading && studentIdCheck.data && studentIdCheck.data.exists && (
                    <div className="id-feedback taken">
                      ❌ This ID is already taken, use another one
                    </div>
                  )}
                  {!studentIdCheck.isLoading && studentIdCheck.data && !studentIdCheck.data.exists && (
                    <div className="id-feedback available">
                      ✅ This ID is available
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Full Name <span style={{color: 'red'}}>*</span></label>
              <input
                className="form-input"
                name="name"
                placeholder="Enter student's full name"
                value={form.name}
                onChange={handleChange}
                required
                autocomplete="off"
              />
            </div>
            <div className="form-group">
              <label>Age (Optional)</label>
              <input
                className="form-input"
                name="age"
                type="number"
                min="10"
                max="30"
                placeholder="Enter student's age (optional)"
                value={form.age}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Grade <span style={{color: 'red'}}>*</span></label>
              <GradeSelect 
                selectedGrade={form.grade} 
                onGradeChange={(grade) => handleChange({ target: { name: 'grade', value: grade } })} 
                required 
                isOpen={openDropdown === 'grade'}
                onToggle={() => setOpenDropdown(openDropdown === 'grade' ? null : 'grade')}
                onClose={() => setOpenDropdown(null)}
              />
            </div>
            <div className="form-group">
              <label>School <span style={{color: 'red'}}>*</span></label>
              <input
                className="form-input"
                name="school"
                placeholder="Enter student's school"
                value={form.school}
                onChange={handleChange}
                required
                autocomplete="off"
              />
            </div>
            <div className="form-group">
              <label>Phone <span style={{color: 'red'}}>*</span></label>
              <input
                className="form-input"
                name="phone"
                type="tel"
                pattern="[0-9]*"
                inputMode="numeric"
                placeholder="Enter student's phone number (11 digits)"
                value={form.phone}
                maxLength={11}
                onChange={(e) => {
                  // Only allow numbers and limit to 11 digits
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                  handleChange({ target: { name: 'phone', value } });
                }}
                required
                autocomplete="off"
              />
              <small style={{ color: '#6c757d', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                Must be exactly 11 digits (e.g., 012345678901)
              </small>
            </div>
            <div className="form-group">
              <label>Parent's Phone <span style={{color: 'red'}}>*</span></label>
              <input
                className="form-input"
                name="parentsPhone"
                type="tel"
                pattern="[0-9]*"
                inputMode="numeric"
                placeholder="Enter parent's phone number (11 digits)"
                value={form.parentsPhone}
                maxLength={11}
                onChange={(e) => {
                  // Only allow numbers and limit to 11 digits
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                  handleChange({ target: { name: 'parentsPhone', value } });
                }}
                required
                autocomplete="off"
              />
              <small style={{ color: '#6c757d', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                Must be exactly 11 digits (e.g., 01234567890)
              </small>
            </div>
            <div className="form-group">
              <label>Main Center <span style={{color: 'red'}}>*</span></label>
              <CenterSelect 
                selectedCenter={form.main_center} 
                onCenterChange={(center) => handleChange({ target: { name: 'main_center', value: center } })} 
                required 
                isOpen={openDropdown === 'center'}
                onToggle={() => setOpenDropdown(openDropdown === 'center' ? null : 'center')}
                onClose={() => setOpenDropdown(null)}
              />
            </div>
            <button 
              type="submit" 
              disabled={createStudentMutation.isPending || (!studentIdCheck.isLoading && studentIdCheck.data && studentIdCheck.data.exists)} 
              className="submit-btn"
            >
              {createStudentMutation.isPending ? "Adding..." : "Add Student"}
            </button>
          </form>
        </div>
        
        {/* Success message and buttons outside form container */}
        {success && (
          <div>
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
            {showQRButton && (
              <div style={{ marginTop: 12 }}>
                <button className="submit-btn" onClick={handleCreateQR}>
                🏷️ Create QR Code for this ID: {form.id || newId}
                </button>
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <button 
                className="submit-btn" 
                onClick={handleAddAnotherStudent}
                style={{
                  background: 'linear-gradient(135deg, #17a2b8 0%, #20c997 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: '1rem',
                  padding: '14px 20px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(23, 162, 184, 0.3)',
                  width: '100%'
                }}
              >
                ➕ Add Another Student
              </button>
            </div>
          </div>
        )}
        
        {/* Error message outside form container */}
        {error && (
          <div className="error-message">❌ {error}</div>
        )}
      </div>
    </div>
  );
} 