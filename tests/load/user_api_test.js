import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const http200Counter = new Counter('http_200_responses');

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<200'],
  },
  ext: {
    loadimpact: {
      projectID: 1234567,
      name: 'User API Load Test',
    }
  }
};

export default function () {
  const BASE_URL = 'http://localhost:5000';

  let userId = null;

  const headers = {
    'Content-Type': 'application/json',
  };

  // --- 1. Criar usuário ---
  let createPayload = {
    nome: `k6User_${__VU}_${__ITER}`,
    email: `k6user_${__VU}_${__ITER}@example.com`,
    senha: 'testpassword',
    endereco: 'Rua Teste, 123',
    telefone: '11999999999'
  };

  let createRes = http.post(`${BASE_URL}/users`, JSON.stringify(createPayload), {
    headers,
    tags: { name: 'CreateUser' }
  });

  check(createRes, {
    'Create User status is 201': (r) => r.status === 201,
    'Create User has ID': (r) => r.json().user && r.json().user.id,
  });

  if (createRes.status === 201) {
    userId = createRes.json().user.id;
    http200Counter.add(1);
  }

  sleep(1);

  // --- 2. Listar todos ---
  let getAllRes = http.get(`${BASE_URL}/users`, {
    tags: { name: 'GetAllUsers' }
  });

  check(getAllRes, {
    'Get All Users status is 200': (r) => r.status === 200,
    'Get All Users is array': (r) => Array.isArray(r.json()),
  });

  if (getAllRes.status === 200) {
    http200Counter.add(1);
  }

  sleep(1);

  // --- 3. Buscar por ID ---
  if (userId) {
    let getOneRes = http.get(`${BASE_URL}/users/${userId}`, {
      tags: { name: 'GetOneUser' }
    });

    check(getOneRes, {
      'Get One User status is 200': (r) => r.status === 200,
      'User ID matches': (r) => r.json().id === userId,
    });

    if (getOneRes.status === 200) {
      http200Counter.add(1);
    }

    sleep(1);

    // --- 4. Atualizar usuário ---
    let updatePayload = {
      nome: `k6UserUpdated_${__VU}_${__ITER}`,
      telefone: `987654321_${__VU}`
    };

    let updateRes = http.put(`${BASE_URL}/users/${userId}`, JSON.stringify(updatePayload), {
      headers,
      tags: { name: 'UpdateUser' }
    });

    check(updateRes, {
      'Update User status is 200': (r) => r.status === 200,
    });

    if (updateRes.status === 200) {
      http200Counter.add(1);
    }

    sleep(1);

    // --- 5. Deletar usuário ---
    let deleteRes = http.del(`${BASE_URL}/users/${userId}`, null, {
      tags: { name: 'DeleteUser' }
    });

    check(deleteRes, {
      'Delete User status is 200': (r) => r.status === 200,
    });

    if (deleteRes.status === 200) {
      http200Counter.add(1);
    }

    sleep(1);
  }
}
