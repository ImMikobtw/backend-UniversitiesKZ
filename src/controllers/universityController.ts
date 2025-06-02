import { Request, Response, RequestHandler } from 'express';
import { QueryResult } from 'pg';
import pool from '../config/db';
import { University } from '../types';

export const getUniversities: RequestHandler = async (req, res) => {
  try {
    const result: QueryResult<University> = await pool.query('SELECT * FROM universities');
    res.json(result.rows);
  } catch (error) {
    console.error('Get universities error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addUniversity: RequestHandler = async (req, res) => {
  const {
    nameKZ,
    nameRU,
    abbreviationKZ,
    abbreviationRU,
    address,
    website,
    phone,
    email,
    whatsapp,
    code,
    status,
    studentCount,
    entScore,
    qsScore,
    logoUrl,
    mapPoint,
    description,
    services,
  } = req.body;

  try {
    const result: QueryResult<University> = await pool.query(
      `INSERT INTO universities (
        name_kz, name_ru, abbreviation_kz, abbreviation_ru, address, website, phone, email, whatsapp,
        code, status, student_count, ent_score, qs_score, logo_url, map_point, description, services
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
      [
        nameKZ,
        nameRU,
        abbreviationKZ,
        abbreviationRU,
        address,
        website,
        phone,
        email,
        whatsapp,
        code,
        status,
        studentCount,
        entScore,
        qsScore,
        logoUrl,
        mapPoint,
        description,
        services,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add university error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};