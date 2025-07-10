from flask import request, jsonify
from app import app, db
from models import Usuario
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

# Rota para criar um novo usuário (CREATE)
@app.route('/users', methods=['POST'])
def create_user():
    """Cria um novo usuario."""
    data = request.get_json() or {}
    
    if not data or not all(key in data for key in ['nome', 'email', 'senha']):
        return jsonify({'message': 'Dados incompletos!'}), 400

    if Usuario.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email já cadastrado!'}), 409

    new_user = Usuario(
        nome=data['nome'],
        email=data['email'],
        senha=generate_password_hash(data['senha']),
        endereco=data.get('endereco'),
        telefone=data.get('telefone')
    )

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'Usuário criado com sucesso!', 'user': new_user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro ao criar usuário: {str(e)}'}), 500

# Rota para obter todos os usuários (READ ALL)
@app.route('/users', methods=['GET'])
def get_users():
    """Busca todos os usuarios"""
    users = Usuario.query.all()
    return jsonify([user.to_dict() for user in users]), 200

# Rota para obter um usuário por ID (READ ONE)
@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Encontra um usuario especifico"""
    user = Usuario.query.get(user_id)
    if user:
        return jsonify(user.to_dict()), 200
    return jsonify({'message': 'Usuário não encontrado!'}), 404

# Rota para atualizar um usuário (UPDATE)
@app.route('/users/<int:user_id>', methods=['PUT', 'PATCH'])
def update_user(user_id):
    """Atualiza os dados de um usuario existente."""
    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({'message': 'Usuário não encontrado!'}), 404

    data = request.get_json() or {}
    if not data:
        return jsonify({'message': 'Nenhum dado fornecido para atualização!'}), 400

    user.nome = data.get('nome', user.nome)
    user.email = data.get('email', user.email)
    if 'senha' in data and data['senha']:
        user.senha = generate_password_hash(data['senha'])
    user.endereco = data.get('endereco', user.endereco)
    user.telefone = data.get('telefone', user.telefone)

    try:
        db.session.commit()
        return jsonify({'message': 'Usuário atualizado com sucesso!', 'user': user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro ao atualizar usuário: {str(e)}'}), 500

# Rota para deletar um usuário (DELETE)
@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Exclui um usuario."""
    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({'message': 'Usuário não encontrado!'}), 404

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'Usuário deletado com sucesso!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erro ao deletar usuário: {str(e)}'}), 500