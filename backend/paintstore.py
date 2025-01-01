from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from database import Product, Sale, PaintClass
from datetime import datetime
import pytz

paintstore = Blueprint('paintstore', __name__)


def init_routes(db_session):
    eat_timezone = pytz.timezone('Africa/Nairobi')

    @paintstore.route('/paint-classes', methods=['GET'])
    def get_paint_classes():
        try:
            classes = db_session.query(PaintClass).all()
            return jsonify([c.name for c in classes])
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @paintstore.route('/admin/paint-classes', methods=['POST'])
    def add_paint_class():
        try:
            class_name = request.json.get('name')
            if not class_name:
                return jsonify({'success': False, 'message': 'Class name is required'}), 400

            new_class = PaintClass(name=class_name)
            db_session.add(new_class)
            db_session.commit()

            return jsonify({
                'success': True,
                'message': 'Paint class added successfully',
                'id': new_class.id
            })
        except Exception as e:
            db_session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 400

    @paintstore.route('/admin/paint-classes/<path:class_name>', methods=['DELETE'])
    def delete_paint_class(class_name):
        try:
            paint_class = db_session.query(PaintClass).filter_by(name=class_name).first()
            if not paint_class:
                return jsonify({'success': False, 'message': 'Paint class not found'}), 404

            #Check if there are any products using this class
            products_using_class = db_session.query(Product).filter_by(paint_class=class_name).first()
            if products_using_class:
                return jsonify({
                    'success': False,
                    'message': 'Cannot delete paint class that is being used by products'
                }), 400

            db_session.delete(paint_class)
            db_session.commit()
            return jsonify({'success': True, 'message': 'Paint class deleted successfully'})
        except Exception as e:
            db_session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 400

    @paintstore.route('/admin/paint-classes/<path:class_name>', methods=['PUT'])
    def update_paint_class(class_name):
        try:
            new_name = request.json.get('name')
            if not new_name:
                return jsonify({'success': False, 'message': 'New class name is required'}), 400

            paint_class = db_session.query(PaintClass).filter_by(name=class_name).first()
            if not paint_class:
                return jsonify({'success': False, 'message': 'Paint class not found'}), 404

            # Check if the new name already exists
            existing_class = db_session.query(PaintClass).filter_by(name=new_name).first()
            if existing_class and existing_class.name != class_name:
                return jsonify({'success': False, 'message': 'Paint class name already exists'}), 400

            # Update all products using this class
            products = db_session.query(Product).filter_by(paint_class=class_name).all()
            for product in products:
                product.paint_class = new_name

            paint_class.name = new_name
            db_session.commit()
            return jsonify({'success': True, 'message': 'Paint class updated successfully'})
        except Exception as e:
            db_session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 400

    @paintstore.route('/items', methods=['GET'])
    def get_items():
        try:
            items = db_session.query(Product).all()
            return jsonify([{
                'id': item.id,
                'name': item.name,
                'stock': item.stock,
                'class': item.paint_class
            } for item in items])
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @paintstore.route('/sell', methods=['POST'])
    def sell_item():
        try:
            name = request.json['name']
            quantity_to_sell = request.json['quantity']
            buyer_name = request.json['buyerName']  # Get buyer name from request

            if not buyer_name:
                return jsonify({'success': False, 'message': "Buyer name is required!"})

            item = db_session.query(Product).filter_by(name=name).first()
            if item:
                if quantity_to_sell <= item.stock:
                    current_stock = item.stock
                    new_stock = current_stock - quantity_to_sell
                    item.stock = new_stock

                    sale = Sale(
                        item_name=name,
                        quantity=quantity_to_sell,
                        buyer_name=buyer_name,  # Add buyer name to sale record
                        timestamp=datetime.now(eat_timezone),
                        previous_stock=current_stock,
                        new_stock=new_stock
                    )
                    db_session.add(sale)
                    db_session.commit()

                    return jsonify({
                        'success': True,
                        'message': f"Sold {quantity_to_sell} units of {name} to {buyer_name}. New stock: {new_stock}"
                    })
                else:
                    return jsonify({'success': False, 'message': "Not enough stock!"})
            else:
                return jsonify({'success': False, 'message': "Item not found!"})
        except Exception as e:
            db_session.rollback()
            return jsonify({'error': str(e)}), 500

    @paintstore.route('/sales-history', methods=['GET'])
    def get_sales_history():
        try:
            start_date = request.args.get('start_date')
            end_date = request.args.get('end_date')
            buyer_name = request.args.get('buyer_name')  # Add buyer name filter option

            query = db_session.query(Sale)

            if start_date and end_date:
                start = datetime.fromisoformat(start_date)
                end = datetime.fromisoformat(end_date)
                if start.tzinfo is None:
                    start = eat_timezone.localize(start)
                if end.tzinfo is None:
                    end = eat_timezone.localize(end)
                query = query.filter(Sale.timestamp.between(start, end))

            if buyer_name:  # Add filter for buyer name if provided
                query = query.filter(Sale.buyer_name.ilike(f'%{buyer_name}%'))

            sales = query.order_by(Sale.timestamp.desc()).all()

            return jsonify([{
                'item_name': sale.item_name,
                'quantity': sale.quantity,
                'buyer_name': sale.buyer_name,  # Include buyer name in response
                'timestamp': sale.timestamp.isoformat(),
                'previous_stock': sale.previous_stock,
                'new_stock': sale.new_stock
            } for sale in sales])
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @paintstore.route('/search', methods=['GET'])
    def search_items():
        try:
            query = request.args.get('q', '')
            results = db_session.query(Product).filter(
                Product.name.ilike(f'%{query}%')
            ).all()
            return jsonify([item.name for item in results])
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @paintstore.route('/admin/products', methods=['POST'])
    def add_product():
        try:
            data = request.json
            if not all(key in data for key in ['name', 'stock', 'class']):
                return jsonify({'success': False, 'message': 'Missing required fields'}), 400

            class_exists = db_session.query(PaintClass).filter_by(name=data['class']).first()
            if not class_exists:
                return jsonify({'success': False, 'message': 'Invalid paint class'}), 400

            new_product = Product(
                name=data['name'],
                stock=data['stock'],
                paint_class=data['class']
            )
            db_session.add(new_product)
            db_session.commit()

            return jsonify({
                'success': True,
                'message': 'Product added successfully',
                'id': new_product.id
            })
        except Exception as e:
            db_session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 400

    @paintstore.route('/admin/products/<int:product_id>', methods=['PUT'])
    def update_product(product_id):
        try:
            data = request.json
            product = db_session.query(Product).get(product_id)

            if not product:
                return jsonify({'success': False, 'message': 'Product not found'}), 404

            if 'class' in data:
                class_exists = db_session.query(PaintClass).filter_by(name=data['class']).first()
                if not class_exists:
                    return jsonify({'success': False, 'message': 'Invalid paint class'}), 400
                product.paint_class = data['class']

            if 'name' in data:
                product.name = data['name']
            if 'stock' in data:
                product.stock = data['stock']

            db_session.commit()
            return jsonify({'success': True, 'message': 'Product updated successfully'})
        except Exception as e:
            db_session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 400

    @paintstore.route('/admin/products/<int:product_id>', methods=['DELETE'])
    def delete_product(product_id):
        try:
            product = db_session.query(Product).get(product_id)
            if not product:
                return jsonify({'success': False, 'message': 'Product not found'}), 404

            db_session.delete(product)
            db_session.commit()
            return jsonify({'success': True, 'message': 'Product deleted successfully'})
        except Exception as e:
            db_session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 400

    return paintstore