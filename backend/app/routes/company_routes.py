from flask import Blueprint, request
from app.models.models import Company, Job
from app.utils.helpers import api_response

company_bp = Blueprint('companies', __name__, url_prefix='/api/companies')

@company_bp.route('', methods=['GET'])
def get_companies():
    search = request.args.get('search', '').strip()
    query = Company.query
    if search:
        query = query.filter((Company.name.ilike(f'%{search}%')) | (Company.industry.ilike(f'%{search}%')))
    
    companies = query.all()
    return api_response(True, "Companies list", data={"companies": [c.to_dict() for c in companies]})


@company_bp.route('/<int:company_id>', methods=['GET'])
def get_company_details(company_id):
    company = Company.query.get(company_id)
    if not company:
        return api_response(False, "Company not found", 404)

    comp_dict = company.to_dict()
    # Fetch active and closed jobs
    published_jobs = Job.query.filter_by(company_id=company_id, status='published').all()
    comp_dict['published_jobs'] = [j.to_dict() for j in published_jobs]

    return api_response(True, "Company details", data={"company": comp_dict})
