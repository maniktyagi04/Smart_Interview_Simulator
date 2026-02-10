// Native fetch is available in Node 18+
// Running with node src/scripts/verify_flow.js

const BASE_URL = 'http://localhost:5005/api';

async function verifyFlow() {
    try {
        // 0. Health Check
        const health = await fetch('http://localhost:5000/health');
        console.log('Health Check Status:', health.status);

        // 1. Login as Admin
        console.log('--- Logging in as Admin ---');
        const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
        });
        
        console.log('Admin Login Status:', adminLogin.status);
        const adminText = await adminLogin.text();
        console.log('Admin Login Response:', adminText);
        
        if (!adminLogin.ok) throw new Error(`Admin login failed: ${adminText}`);
        
        const adminData = JSON.parse(adminText);
        const adminToken = adminData.token;
        if (!adminToken) throw new Error('Admin login failed');
        console.log('Admin logged in.');

        // 2. Fetch Admin Sessions (Pending Reviews)
        console.log('--- Fetching Admin Sessions ---');
        const adminSessionsRes = await fetch(`${BASE_URL}/analytics/admin/sessions`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const adminSessions = await adminSessionsRes.json();
        console.log(`Found ${adminSessions.length} sessions for admin.`);

        // Find a session that is EVALUATED (Simulating the one Sarah just finished)
        // If Sarah's session is EVALUATED, it should be here.
        const targetSession = adminSessions.find(s => s.status === 'EVALUATED');
        
        if (!targetSession) {
            console.log('No EVALUATED session found. Sarah\'s session might already be REPORTED or not yet EVALUATED.');
            // Let's check all sessions to see where it is
            // Actually the endpoint I used returns ALL sessions but my frontend filtered efficiently? 
            // No, the controller uses `AnalyticsService.getAllSessions()` which returns ALL sessions.
            // My frontend filters `s.status === 'EVALUATED'`. 
            // So `adminSessions` variable here corresponds to what the Controller returns (ALL).
            // So `targetSession` logic above is checking for status field in the returned JSON.
            // Let's check status of the first session just to see.
             if(adminSessions.length > 0) console.log('First session status:', adminSessions[0].status);
        }

        if (targetSession) {
            console.log(`Found target session: ${targetSession.id} (${targetSession.candidate}) - Status: ${targetSession.status}`);
            
            // 3. Send Report (Update Status to REPORTED)
            console.log('--- Sending Report (Setting to REPORTED) ---');
            const updateRes = await fetch(`${BASE_URL}/sessions/${targetSession.id}/status`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'REPORTED' })
            });
            const updateData = await updateRes.json();
            console.log('Update response:', updateData.status);
        } else {
            console.warn('Skipping "Send Report" step as no EVALUATED session was found (it might be already REPORTED).');
        }

        // 4. Login as Sarah
        console.log('--- Logging in as Sarah ---');
        const studentLogin = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'sarah@example.com', password: 'sarah123' })
        });
        const studentData = await studentLogin.json();
        const studentToken = studentData.token;
        if (!studentToken) throw new Error('Student login failed');
        console.log('Sarah logged in.');

        // 5. Fetch Student Reports
        console.log('--- Fetching Student History ---');
        const historyRes = await fetch(`${BASE_URL}/sessions/history`, {
            headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        const history = await historyRes.json();
        
        // Filter for REPORTED
        const reports = history.filter(s => s.status === 'REPORTED');
        console.log(`Found ${reports.length} REPORTED sessions for Sarah.`);
        
        if (reports.length > 0) {
            console.log('SUCCESS: Sarah can see her report!');
        } else {
            console.error('FAILURE: Sarah cannot see any REPORTED sessions.');
            console.log('All history statuses:', history.map(s => s.status));
        }

    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verifyFlow();
