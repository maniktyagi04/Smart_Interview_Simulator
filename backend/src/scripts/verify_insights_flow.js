
// Native fetch is available in Node 18+

const BASE_URL = 'http://localhost:5005/api';
let studentToken = '';
let adminToken = '';
let studentId = '';
let sessionId = '';



async function run() {
  console.log('🚀 Starting Full Flow Verification...');

  try {
    // 1. Admin Login (Prerequisite)
    console.log('\n--- 1. Admin Login ---');
    const adminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' }) 
    });
    
    if (!adminRes.ok) throw new Error(`Admin login failed: ${await adminRes.text()}`);
    const adminData = await adminRes.json();
    adminToken = adminData.token;
    console.log('✅ Admin logged in.');

    // 2. Register New Student
    console.log('\n--- 2. Register Student ---');
    const timestamp = Date.now();
    const studentEmail = `student_${timestamp}@test.com`;
    const studentRes = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: studentEmail, 
            password: 'password123',
            name: `Test Student ${timestamp}`
        })
    });

    if (!studentRes.ok) throw new Error(`Student signup failed: ${await studentRes.text()}`);
    const studentData = await studentRes.json();
    studentToken = studentData.token;
    studentId = studentData.user.id;
    console.log(`✅ Student registered: ${studentEmail} (${studentId})`);

    // 3. Start Interview (Student)
    console.log('\n--- 3. Start Interview ---');
    const startRes = await fetch(`${BASE_URL}/sessions`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ 
            type: 'TECHNICAL',
            difficulty: 'EASY',
            technologies: ['React', 'Node.js']
        })
    });

    if (!startRes.ok) throw new Error(`Start interview failed: ${await startRes.text()}`);
    const sessionData = await startRes.json();
    sessionId = sessionData.id;
    console.log(`✅ Interview Session Started: ${sessionId}`);

    // 4. Submit Interview (Student)
    console.log('\n--- 4. Submit Interview ---');
    // Using updateStatus to simulate submission for simplicity if allowed, or flow might differ
    // Usually it's a specific endpoint. Let's try patching status if allowed or specific end endpoint.
    // Checking session service, updateStatus is used.
    const submitRes = await fetch(`${BASE_URL}/sessions/${sessionId}/status`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ status: 'SUBMITTED' })
    });

    if (!submitRes.ok) throw new Error(`Submit interview failed: ${await submitRes.text()}`);
    console.log('✅ Interview Submitted.');

    // 5. Mock AI Evaluation (Admin Action)
    console.log('\n--- 5. Mock AI Evaluation (Admin Action) ---');
    // First check current status
    const checkRes = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const checkData = await checkRes.json();
    
    if (checkData.status === 'EVALUATED') {
        console.log('✅ Session is already EVALUATED (Automatic or previous step). Skipping manual update.');
    } else {
        const evalRes = await fetch(`${BASE_URL}/sessions/${sessionId}/status`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ status: 'EVALUATED' })
        });

        if (!evalRes.ok) {
             const errText = await evalRes.text();
             // Ignore if it says "Invalid state transition from EVALUATED to EVALUATED" just in case of race condition
             if (!errText.includes('from EVALUATED to EVALUATED')) {
                 throw new Error(`Evaluation update failed: ${errText}`);
             }
        }
        console.log('✅ Session status updated to EVALUATED.');
    }

    // 6. Admin Reviews & Sends Report
    console.log('\n--- 6. Admin Sends Report ---');
    const reportRes = await fetch(`${BASE_URL}/sessions/${sessionId}/status`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: 'REPORTED' })
    });

    if (!reportRes.ok) throw new Error(`Sending report failed: ${await reportRes.text()}`);
    console.log('✅ Report Sent (Status: REPORTED).');

    // 7. Student Verifies Receipt
    console.log('\n--- 7. Student Verifies Receipt ---');
    const studentHistoryRes = await fetch(`${BASE_URL}/sessions/history`, {
        headers: { 'Authorization': `Bearer ${studentToken}` }
    });

    if (!studentHistoryRes.ok) throw new Error(`Fetch history failed: ${await studentHistoryRes.text()}`);
    const history = await studentHistoryRes.json();
    
    const targetSession = history.find(s => s.id === sessionId);
    if (!targetSession) throw new Error('Session not found in student history.');
    
    if (targetSession.status === 'REPORTED') {
        console.log('✅ verification SUCCESS: Student sees the session with status REPORTED.');
    } else {
        throw new Error(`Verification FAILED: Expected status REPORTED, got ${targetSession.status}`);
    }

    console.log('\n🎉 FULL FLOW VERIFICATION SUCCESSFUL 🎉');

  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:', error.message);
    process.exit(1);
  }
}

run();
