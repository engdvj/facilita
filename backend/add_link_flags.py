#!/usr/bin/env python3
"""
Script para adicionar as colunas is_public e is_favorite na tabela links
"""
import sqlite3
import os

def add_link_flags():
    # Caminho para o banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'facilita.sqlite')
    
    if not os.path.exists(db_path):
        print(f"Banco de dados não encontrado em: {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Verificar se as colunas já existem
        cursor.execute("PRAGMA table_info(links)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'is_public' not in columns:
            print("Adicionando coluna is_public...")
            cursor.execute("ALTER TABLE links ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT 0")
            print("OK - Coluna is_public adicionada")
        else:
            print("OK - Coluna is_public ja existe")
        
        if 'is_favorite' not in columns:
            print("Adicionando coluna is_favorite...")
            cursor.execute("ALTER TABLE links ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT 0")
            print("OK - Coluna is_favorite adicionada")
        else:
            print("OK - Coluna is_favorite ja existe")
        
        conn.commit()
        print("SUCESSO - Migracao concluida com sucesso!")
        
    except Exception as e:
        print(f"ERRO durante a migracao: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    add_link_flags()