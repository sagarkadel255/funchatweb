"use server";

import { cookies } from "next/headers";

const BASE_URL = "http://localhost:5000/api";

async function authHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getUsers() {
  return fetch(`${BASE_URL}/admin/users`, {
    headers: await authHeaders(),
    cache: "no-store",
  }).then(res => res.json());
}

export async function getUser(id: string) {
  return fetch(`${BASE_URL}/admin/users/${id}`, {
    headers: await authHeaders(),
    cache: "no-store",
  }).then(res => res.json());
}

export async function createUser(data: FormData) {
  return fetch(`${BASE_URL}/admin/users`, {
    method: "POST",
    headers: await authHeaders(),
    body: data,
  }).then(res => res.json());
}

export async function updateUser(id: string, data: FormData) {
  return fetch(`${BASE_URL}/admin/users/${id}`, {
    method: "PUT",
    headers: await authHeaders(),
    body: data,
  }).then(res => res.json());
}

export async function deleteUser(id: string) {
  return fetch(`${BASE_URL}/admin/users/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  }).then(res => res.json());
}
