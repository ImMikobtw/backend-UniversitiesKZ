import { Request, Response, RequestHandler } from 'express';
import { QueryResult } from 'pg';
import pool from '../config/db';
import { Specialty } from '../types';

export const addSpecialty: RequestHandler = async (req, res) => {
  const { universityId, code, name, description, entScore } = req.body;

  try {
    const universityResult: QueryResult<{ id: number }> = await pool.query('SELECT id FROM universities WHERE id = $1', [universityId]);
    if (universityResult.rows.length === 0) {
      res.status(400).json({ error: 'Invalid university' });
      return;
    }

    const result: QueryResult<Specialty> = await pool.query(
      'INSERT INTO specialties (university_id, code, name, description, ent_score) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [universityId, code, name, description, entScore]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add specialty error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSpecialties: RequestHandler = async (req, res) => {
  const { universityId } = req.query;

  try {
    const result: QueryResult<Specialty> = await pool.query('SELECT * FROM specialties WHERE university_id = $1', [universityId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get specialties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};