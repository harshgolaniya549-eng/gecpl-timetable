async function runTests() {
  const base = 'http://localhost:5000/api';
  console.log('Testing APIs on', base);

  // 1. Health Check
  try {
    const res = await fetch(`${base}/health`);
    const data = await res.json();
    console.log('✔ Health Check:', data.status, data.service);
  } catch (e) {
    console.error('✘ Health Check Failed:', e.message);
  }

  // 2. Student Login Success
  try {
    const res = await fetch(`${base}/students/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'CE52', password: '2026' })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      console.log('✔ Student Login Success:', data.message, `(Roll: ${data.data.roll_number}, Batch: ${data.data.batch})`);
    } else {
      console.error('✘ Student Login Failed:', data);
    }
  } catch (e) {
    console.error('✘ Student Login Error:', e.message);
  }

  // 3. Student Login Wrong Password Validation (Should return 401)
  try {
    const res = await fetch(`${base}/students/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'CE52', password: 'wrongpassword' })
    });
    const data = await res.json();
    if (res.status === 401 && !data.success) {
      console.log('✔ Student Wrong Password Validation (401):', data.message);
    } else {
      console.error('✘ Expected 401 for wrong password, got:', res.status, data);
    }
  } catch (e) {
    console.error('✘ Student Wrong Password Test Error:', e.message);
  }

  // 4. Student Login Not Found Validation (Should return 404)
  try {
    const res = await fetch(`${base}/students/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'CE999', password: '2026' })
    });
    const data = await res.json();
    if (res.status === 404 && !data.success) {
      console.log('✔ Student Not Found Validation (404):', data.message);
    } else {
      console.error('✘ Expected 404, got:', res.status, data);
    }
  } catch (e) {
    console.error('✘ Student Not Found Test Error:', e.message);
  }

  // 5. Student Login Empty Validation (Should return 400)
  try {
    const res = await fetch(`${base}/students/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '', password: '' })
    });
    const data = await res.json();
    if (res.status === 400 && !data.success) {
      console.log('✔ Student Empty Field Validation (400):', data.message);
    } else {
      console.error('✘ Expected 400, got:', res.status, data);
    }
  } catch (e) {
    console.error('✘ Empty Validation Test Error:', e.message);
  }

  // 6. Faculty Login Success
  try {
    const res = await fetch(`${base}/faculty/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'HOD_RHJ', password: '2026' })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      console.log('✔ Faculty Login Success:', data.message, `(${data.data.designation})`);
    } else {
      console.error('✘ Faculty Login Failed:', data);
    }
  } catch (e) {
    console.error('✘ Faculty Login Error:', e.message);
  }

  // 7. Timetable API for CP1, CP2, CP3
  try {
    for (const b of ['CP1', 'CP2', 'CP3']) {
      const res = await fetch(`${base}/timetable/${b}`);
      const data = await res.json();
      if (res.ok && data.success && data.data.timetable) {
        const monClasses = data.data.timetable.Monday?.length || 0;
        console.log(`✔ Timetable ${b}: Found, Monday has ${monClasses} slots`);
      } else {
        console.error(`✘ Timetable ${b} Failed:`, data);
      }
    }
  } catch (e) {
    console.error('✘ Timetable Error:', e.message);
  }

  // 8. Students List API & Search
  try {
    const resAll = await fetch(`${base}/students`);
    const dataAll = await resAll.json();
    console.log(`✔ Students List: Total ${dataAll.count} students in database`);

    const resCP1 = await fetch(`${base}/students?batch=CP1`);
    const dataCP1 = await resCP1.json();
    console.log(`✔ Batch CP1 Filter: ${dataCP1.count} students`);

    const resSearch = await fetch(`${base}/students?search=Harshad`);
    const dataSearch = await resSearch.json();
    console.log(`✔ Search 'Harshad': Found ${dataSearch.count} match (${dataSearch.data[0]?.student_name})`);
  } catch (e) {
    console.error('✘ Students List Error:', e.message);
  }

  process.exit(0);
}

runTests();
