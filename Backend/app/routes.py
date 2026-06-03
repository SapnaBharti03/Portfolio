from flask import Blueprint, jsonify, request, g

import json
import uuid
import os
from psycopg2.extras import RealDictCursor
from app.auth_middleware import token_required
from app.config import (
    ALLOWED_MIME_TYPES,
    MAX_FILE_SIZE,
    STORAGE_BUCKET,
    SUPABASE_SERVICE_KEY,
    SUPABASE_URL,
)
from app.database import connection
from datetime import datetime
from supabase import create_client


api_bp = Blueprint(
    "api",
    __name__,
    url_prefix="/api"
)

# ─── Global Supabase Client ────────────────────────────────────────────────────
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# ─── Upload ────────────────────────────────────────────────────────────────────

@api_bp.post("/upload")
@token_required
def upload_image():
    """
    Upload an image to Supabase Storage and return its public URL.

    Query param:
        folder (optional): subfolder in bucket e.g. projects, profile,
                           testimonials, blog. Defaults to 'general'.

    Form data:
        file: the image file (multipart/form-data)

    Response:
        { success, url, path }
        - url  → pass this directly to any create/update API as the image field
        - path → store this if you want to delete the file later
    """
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file provided"}), 400

    file = request.files["file"]

    if not file.filename:
        return jsonify({"success": False, "error": "Empty filename"}), 400

    if file.mimetype not in ALLOWED_MIME_TYPES:
        return jsonify({
            "success": False,
            "error": f"Invalid file type '{file.mimetype}'. Allowed: jpeg, png, webp, gif"
        }), 400

    file_bytes = file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        return jsonify({"success": False, "error": "File too large. Max 5MB allowed"}), 400

    folder      = request.args.get("folder", "general")
    ext         = file.filename.rsplit(".", 1)[-1].lower()
    unique_name = f"{folder}/{uuid.uuid4()}.{ext}"

    try:
        supabase.storage.from_(STORAGE_BUCKET).upload(
            path=unique_name,
            file=file_bytes,
            file_options={"content-type": file.mimetype}
        )

        public_url = supabase.storage.from_(STORAGE_BUCKET).get_public_url(unique_name)

        return jsonify({
            "success": True,
            "url":     public_url,
            "path":    unique_name
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.delete("/upload")
@token_required
def delete_image():
    """
    Delete an image from Supabase Storage.

    JSON body:
        { "path": "projects/uuid.jpg" }   ← the 'path' returned from POST /upload
    """
    data = request.get_json()
    path = data.get("path") if data else None

    if not path:
        return jsonify({"success": False, "error": "No file path provided"}), 400

    try:
        supabase.storage.from_(STORAGE_BUCKET).remove([path])
        return jsonify({"success": True, "message": "File deleted successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─── Projects ──────────────────────────────────────────────────────────────────

@api_bp.post("/projects")
@token_required
def create_project():
    data = request.get_json()
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query  = """
            INSERT INTO public.projects (
                title, slug, short_description, full_description,
                category, tech_stack, cover_image_url, images,
                live_url, github_url, is_featured, display_order,
                challenges, results
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING id
        """
        values = (
            data.get("title"),
            data.get("slug"),
            data.get("short_description"),
            data.get("full_description"),
            data.get("category"),
            json.dumps(data.get("tech_stack", [])),
            data.get("cover_image_url"),
            json.dumps(data.get("images", [])),
            data.get("live_url"),
            data.get("github_url"),
            data.get("is_featured", False),
            data.get("display_order", 0),
            data.get("challenges"),
            data.get("results"),
        )
        cursor.execute(query, values)
        project = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({
            "success":    True,
            "message":    "Project created successfully",
            "project_id": str(project["id"])
        }), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.get("/projects")
def get_projects():
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "SELECT * FROM public.projects WHERE is_deleted = false ORDER BY display_order ASC"
        )
        projects = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({
            "success":  True,
            "projects": [dict(p) for p in projects]
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.put("/projects/<uuid:project_id>")
@token_required
def update_project(project_id):
    data = request.get_json()
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query  = """
            UPDATE public.projects SET
                title             = %s,
                slug              = %s,
                short_description = %s,
                full_description  = %s,
                category          = %s,
                tech_stack        = %s,
                cover_image_url   = %s,
                images            = %s,
                live_url          = %s,
                github_url        = %s,
                is_featured       = %s,
                display_order     = %s,
                challenges        = %s,
                results           = %s
            WHERE id = %s
            RETURNING id
        """
        values = (
            data.get("title"),
            data.get("slug"),
            data.get("short_description"),
            data.get("full_description"),
            data.get("category"),
            json.dumps(data.get("tech_stack", [])),
            data.get("cover_image_url"),
            json.dumps(data.get("images", [])),
            data.get("live_url"),
            data.get("github_url"),
            data.get("is_featured", False),
            data.get("display_order", 0),
            data.get("challenges"),
            data.get("results"),
            str(project_id),
        )
        cursor.execute(query, values)
        project = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not project:
            return jsonify({"success": False, "error": "Project not found"}), 404
        return jsonify({
            "success":    True,
            "message":    "Project updated successfully",
            "project_id": str(project["id"])
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.delete("/projects/<string:project_id>")
@token_required
def delete_project(project_id):
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "UPDATE public.projects SET is_deleted = TRUE WHERE id = %s",
            (project_id,)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": "Project deleted successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─── Skills ────────────────────────────────────────────────────────────────────

@api_bp.get("/skills")
def get_skills():
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "SELECT * FROM public.skills WHERE is_deleted = false ORDER BY display_order ASC"
        )
        skills = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "skills": [dict(s) for s in skills]}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.post("/skills")
@token_required
def create_skills():
    data = request.get_json()
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            INSERT INTO public.skills (name, category, proficiency, display_order)
            VALUES (%s, %s, %s, %s)
            RETURNING id
            """,
            (data.get("name"), data.get("category"), data.get("proficiency"), data.get("display_order", 0))
        )
        skill = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "skills": dict(skill)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.put("/skills/<uuid:skill_id>")
@token_required
def update_skill(skill_id):
    data = request.get_json()
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            UPDATE public.skills SET
                name          = %s,
                category      = %s,
                proficiency   = %s,
                display_order = %s
            WHERE id = %s
            RETURNING id
            """,
            (data.get("name"), data.get("category"), data.get("proficiency"), data.get("display_order", 0), str(skill_id))
        )
        skill = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not skill:
            return jsonify({"success": False, "error": "Skill not found"}), 404
        return jsonify({"success": True, "message": "Skill updated successfully", "skill_id": str(skill["id"])}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.delete("/skills/<string:skill_id>")
@token_required
def delete_skill(skill_id):
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "UPDATE public.skills SET is_deleted = TRUE WHERE id = %s",
            (skill_id,)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": "Skill deleted successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─── Services ──────────────────────────────────────────────────────────────────

@api_bp.post("/services")
@token_required
def create_services():
    data = request.get_json()
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            INSERT INTO public.services (title, description, icon, starting_price, display_order)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, title, description, icon, starting_price, display_order
            """,
            (data.get("title"), data.get("description"), data.get("icon"), data.get("starting_price"), data.get("display_order", 0))
        )
        service = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "service": dict(service)}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.get("/services")
def get_services():
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            SELECT id, title, description, icon, starting_price, display_order
            FROM public.services
            WHERE is_deleted = false
            ORDER BY display_order ASC
            """
        )
        services = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "services": [dict(s) for s in services]}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.put("/services/<string:service_id>")
@token_required
def update_service(service_id):
    data = request.get_json()
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            UPDATE public.services
            SET title = %s, description = %s, icon = %s,
                starting_price = %s, display_order = %s
            WHERE id = %s AND is_deleted = false
            RETURNING id, title, description, icon, starting_price, display_order
            """,
            (data.get("title"), data.get("description"), data.get("icon"), data.get("starting_price"), data.get("display_order", 0), str(service_id))
        )
        service = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not service:
            return jsonify({"success": False, "error": "Service not found"}), 404
        return jsonify({"success": True, "message": "Service updated successfully", "service": dict(service)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.delete("/services/<string:service_id>")
@token_required
def delete_service(service_id):
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "SELECT id FROM public.services WHERE id = %s AND is_deleted = false",
            (str(service_id),)
        )
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Service not found"}), 404
        cursor.execute(
            "UPDATE public.services SET is_deleted = true WHERE id = %s",
            (str(service_id),)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": "Service deleted successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─── Experience ────────────────────────────────────────────────────────────────

@api_bp.post("/experience")
@token_required
def create_experience():
    data    = request.get_json()
    user_id = g.user.get("id")
    if not user_id:
        return jsonify({"success": False, "error": "User id not found in token"}), 401
    try:
        created_by = str(uuid.UUID(str(user_id)))
    except ValueError:
        return jsonify({"success": False, "error": "Invalid user id in token"}), 400
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            INSERT INTO public.experience (
                company_name, role, employment_type, start_date, end_date,
                is_current, description, achievements, created_by, display_order
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING id
            """,
            (
                data.get("company_name"), data.get("role"), data.get("employment_type"),
                data.get("start_date"), data.get("end_date"), data.get("is_current", False),
                data.get("description"), json.dumps(data.get("achievements", [])),
                created_by, data.get("display_order", 0),
            )
        )
        experience = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": "Experience created successfully", "experience_id": str(experience["id"])}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.get("/experience")
def get_experience():
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            SELECT id, company_name, role, employment_type, start_date, end_date,
                   is_current, description, achievements, display_order
            FROM public.experience
            WHERE is_deleted = false
            ORDER BY display_order ASC
            """
        )
        experience = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "experience": [dict(row) for row in experience]}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.put("/experience/<string:experience_id>")
@token_required
def update_experience(experience_id):
    data    = request.get_json()
    user_id = g.user.get("id")
    if not user_id:
        return jsonify({"success": False, "error": "User id not found in token"}), 401
    try:
        updated_by = str(uuid.UUID(str(user_id)))
    except ValueError:
        return jsonify({"success": False, "error": "Invalid user id in token"}), 400
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            UPDATE public.experience SET
                company_name    = %s,
                role            = %s,
                employment_type = %s,
                start_date      = %s,
                end_date        = %s,
                is_current      = %s,
                description     = %s,
                achievements    = %s,
                display_order   = %s,
                updated_by      = %s,
                updated_at      = NOW()
            WHERE id = %s AND is_deleted = false
            RETURNING id
            """,
            (
                data.get("company_name"), data.get("role"), data.get("employment_type"),
                data.get("start_date"), data.get("end_date"), data.get("is_current", False),
                data.get("description"), json.dumps(data.get("achievements", [])),
                data.get("display_order", 0), updated_by, str(experience_id),
            )
        )
        experience = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not experience:
            return jsonify({"success": False, "error": "Experience not found"}), 404
        return jsonify({"success": True, "message": "Experience updated successfully", "experience": dict(experience)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.delete("/experience/<string:experience_id>")
@token_required
def delete_experience(experience_id):
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "UPDATE public.experience SET is_deleted = TRUE WHERE id = %s AND is_deleted = false RETURNING id",
            (str(experience_id),)
        )
        experience = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not experience:
            return jsonify({"success": False, "error": "Experience not found"}), 404
        return jsonify({"success": True, "message": "Experience deleted successfully", "experience": dict(experience)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─── Education ─────────────────────────────────────────────────────────────────

@api_bp.post("/education")
@token_required
def create_education():
    data    = request.get_json()
    user_id = g.user.get("id")
    if not user_id:
        return jsonify({"success": False, "error": "User id not found in token"}), 401
    try:
        created_by = str(uuid.UUID(str(user_id)))
    except ValueError:
        return jsonify({"success": False, "error": "Invalid user id in token"}), 400
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            INSERT INTO public.education (
                degree, field_of_study, institution,
                start_year, end_year, description, created_by
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            RETURNING id
            """,
            (
                data.get("degree"), data.get("field_of_study"), data.get("institution"),
                data.get("start_year"), data.get("end_year"), data.get("description"), created_by,
            )
        )
        education = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": "Education created successfully", "education_id": str(education["id"])}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.get("/education")
def get_education():
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            SELECT id, degree, field_of_study, institution, start_year, end_year, description
            FROM public.education
            WHERE is_deleted = false
            ORDER BY start_year DESC
            """
        )
        education = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "education": [dict(row) for row in education]}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.put("/education/<string:education_id>")
@token_required
def update_education(education_id):
    data    = request.get_json()
    user_id = g.user.get("id")
    if not user_id:
        return jsonify({"success": False, "error": "User id not found in token"}), 401
    try:
        updated_by = str(uuid.UUID(str(user_id)))
    except ValueError:
        return jsonify({"success": False, "error": "Invalid user id in token"}), 400
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            UPDATE public.education SET
                degree         = %s,
                field_of_study = %s,
                institution    = %s,
                start_year     = %s,
                end_year       = %s,
                description    = %s,
                updated_by     = %s,
                updated_at     = NOW()
            WHERE id = %s AND is_deleted = false
            RETURNING id
            """,
            (
                data.get("degree"), data.get("field_of_study"), data.get("institution"),
                data.get("start_year"), data.get("end_year"), data.get("description"),
                updated_by, str(education_id),
            )
        )
        education = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not education:
            return jsonify({"success": False, "error": "Education not found"}), 404
        return jsonify({"success": True, "message": "Education updated successfully", "education": dict(education)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.delete("/education/<string:education_id>")
@token_required
def delete_education(education_id):
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "UPDATE public.education SET is_deleted = true WHERE id = %s AND is_deleted = false RETURNING id",
            (str(education_id),)
        )
        education = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not education:
            return jsonify({"success": False, "error": "Education not found"}), 404
        return jsonify({"success": True, "message": "Education deleted successfully", "education": dict(education)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─── Certifications ────────────────────────────────────────────────────────────

@api_bp.post("/certifications")
@token_required
def create_certification():
    data    = request.get_json()
    user_id = g.user.get("id")
    if not user_id:
        return jsonify({"success": False, "error": "User id not found in token"}), 401
    try:
        created_by = str(uuid.UUID(str(user_id)))
    except ValueError:
        return jsonify({"success": False, "error": "Invalid user id in token"}), 400
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            INSERT INTO public.certifications (name, issuing_organization, issue_date, credential_url, created_by)
            VALUES (%s,%s,%s,%s,%s)
            RETURNING id
            """,
            (data.get("name"), data.get("issuing_organization"), data.get("issue_date"), data.get("credential_url"), created_by)
        )
        certification = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "certification": dict(certification)}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.get("/certifications")
def get_certifications():
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            SELECT id, name, issuing_organization, issue_date, credential_url
            FROM public.certifications
            WHERE is_deleted = false
            ORDER BY issue_date DESC
            """
        )
        certifications = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "certifications": [dict(row) for row in certifications]}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.put("/certifications/<string:certification_id>")
@token_required
def update_certification(certification_id):
    data    = request.get_json()
    user_id = g.user.get("id")
    if not user_id:
        return jsonify({"success": False, "error": "User id not found in token"}), 401
    try:
        updated_by = str(uuid.UUID(str(user_id)))
    except ValueError:
        return jsonify({"success": False, "error": "Invalid user id in token"}), 400
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            UPDATE public.certifications SET
                name                 = %s,
                issuing_organization = %s,
                issue_date           = %s,
                credential_url       = %s,
                updated_by           = %s,
                updated_at           = NOW()
            WHERE id = %s AND is_deleted = false
            RETURNING id
            """,
            (data.get("name"), data.get("issuing_organization"), data.get("issue_date"), data.get("credential_url"), updated_by, str(certification_id))
        )
        certification = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not certification:
            return jsonify({"success": False, "error": "Certification not found"}), 404
        return jsonify({"success": True, "message": "Certification updated successfully", "certification": dict(certification)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.delete("/certifications/<string:certification_id>")
@token_required
def delete_certification(certification_id):
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "UPDATE public.certifications SET is_deleted = true WHERE id = %s AND is_deleted = false RETURNING id",
            (str(certification_id),)
        )
        certification = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not certification:
            return jsonify({"success": False, "error": "Certification not found"}), 404
        return jsonify({"success": True, "message": "Certification deleted successfully", "certification": dict(certification)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─── Testimonials ──────────────────────────────────────────────────────────────

@api_bp.get("/testimonials")
def get_testimonials():
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            SELECT id, client_name, company, position, review_text, star_rating, client_photo_url
            FROM public.testimonials
            WHERE is_deleted = false
            ORDER BY created_at DESC
            """
        )
        testimonials = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "testimonials": [dict(row) for row in testimonials]}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.post("/testimonials")
@token_required
def create_testimonial():
    data    = request.get_json()
    user_id = g.user.get("id")
    if not user_id:
        return jsonify({"success": False, "error": "User id not found in token"}), 401
    try:
        created_by = str(uuid.UUID(str(user_id)))
    except ValueError:
        return jsonify({"success": False, "error": "Invalid user id in token"}), 400
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            INSERT INTO public.testimonials
                (client_name, company, position, review_text, star_rating, client_photo_url, created_by)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            RETURNING id
            """,
            (
                data.get("client_name"), data.get("company"), data.get("position"),
                data.get("review_text"), data.get("star_rating"),
                data.get("client_photo_url"),
                created_by,
            )
        )
        testimonial = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "testimonial": dict(testimonial)}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.put("/testimonials/<string:testimonial_id>")
@token_required
def update_testimonial(testimonial_id):
    data    = request.get_json()
    user_id = g.user.get("id")
    if not user_id:
        return jsonify({"success": False, "error": "User id not found in token"}), 401
    try:
        updated_by = str(uuid.UUID(str(user_id)))
    except ValueError:
        return jsonify({"success": False, "error": "Invalid user id in token"}), 400
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            UPDATE public.testimonials SET
                client_name      = %s,
                company          = %s,
                position         = %s,
                review_text      = %s,
                star_rating      = %s,
                client_photo_url = %s,
                updated_by       = %s,
                updated_at       = NOW()
            WHERE id = %s AND is_deleted = false
            RETURNING id
            """,
            (
                data.get("client_name"), data.get("company"), data.get("position"),
                data.get("review_text"), data.get("star_rating"),
                data.get("client_photo_url"),
                updated_by, str(testimonial_id),
            )
        )
        testimonial = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not testimonial:
            return jsonify({"success": False, "error": "Testimonial not found"}), 404
        return jsonify({"success": True, "message": "Testimonial updated successfully", "testimonial": dict(testimonial)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.delete("/testimonials/<string:testimonial_id>")
@token_required
def delete_testimonial(testimonial_id):
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "UPDATE public.testimonials SET is_deleted = true WHERE id = %s AND is_deleted = false RETURNING id",
            (str(testimonial_id),)
        )
        testimonial = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not testimonial:
            return jsonify({"success": False, "error": "Testimonial not found"}), 404
        return jsonify({"success": True, "message": "Testimonial deleted successfully", "testimonial": dict(testimonial)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─── Blog Posts ────────────────────────────────────────────────────────────────

@api_bp.post("/blog-posts")
@token_required
def create_blog_post():
    data    = request.get_json()
    user_id = g.user.get("id")
    if not user_id:
        return jsonify({"success": False, "error": "User id not found in token"}), 401
    try:
        created_by = str(uuid.UUID(str(user_id)))
    except ValueError:
        return jsonify({"success": False, "error": "Invalid user id in token"}), 400
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            INSERT INTO public.blog_posts
                (title, slug, excerpt, cover_image_url, published_at, tags, content, created_by, status)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING id
            """,
            (
                data.get("title"), data.get("slug"), data.get("excerpt"),
                data.get("cover_image_url"),
                data.get("published_at"),
                json.dumps(data.get("tags", [])),
                data.get("content"), created_by, data.get("status"),
            )
        )
        blog_post = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "blog_post": dict(blog_post)}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.get("/blog-posts")
def get_blog_posts():
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            SELECT id, title, slug, excerpt, cover_image_url, published_at, tags, content, created_by, status
            FROM public.blog_posts
            WHERE is_deleted = false
            ORDER BY published_at DESC
            """
        )
        blog_posts = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "blog_posts": [dict(row) for row in blog_posts]}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.put("/blog-posts/<string:blog_post_id>")
@token_required
def update_blog_post(blog_post_id):
    data    = request.get_json()
    user_id = g.user.get("id")
    if not user_id:
        return jsonify({"success": False, "error": "User id not found in token"}), 401
    try:
        updated_by = str(uuid.UUID(str(user_id)))
    except ValueError:
        return jsonify({"success": False, "error": "Invalid user id in token"}), 400
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            UPDATE public.blog_posts SET
                title           = %s,
                slug            = %s,
                excerpt         = %s,
                cover_image_url = %s,
                published_at    = %s,
                tags            = %s,
                content         = %s,
                status          = %s,
                updated_by      = %s,
                updated_at      = NOW()
            WHERE id = %s AND is_deleted = false
            RETURNING id
            """,
            (
                data.get("title"), data.get("slug"), data.get("excerpt"),
                data.get("cover_image_url"),
                data.get("published_at"),
                json.dumps(data.get("tags", [])),
                data.get("content"), data.get("status"),
                updated_by, str(blog_post_id),
            )
        )
        blog_post = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not blog_post:
            return jsonify({"success": False, "error": "Blog post not found"}), 404
        return jsonify({"success": True, "message": "Blog post updated successfully", "blog_post": dict(blog_post)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.delete("/blog-posts/<string:blog_post_id>")
@token_required
def delete_blog_post(blog_post_id):
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "UPDATE public.blog_posts SET is_deleted = true WHERE id = %s AND is_deleted = false RETURNING id",
            (str(blog_post_id),)
        )
        blog_post = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not blog_post:
            return jsonify({"success": False, "error": "Blog post not found"}), 404
        return jsonify({"success": True, "message": "Blog post deleted successfully", "blog_post": dict(blog_post)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─── Social Links ──────────────────────────────────────────────────────────────

@api_bp.post("/social-links")
@token_required
def create_social_link():
    data    = request.get_json()
    user_id = g.user.get("id")
    if not user_id:
        return jsonify({"success": False, "error": "User id not found in token"}), 401
    try:
        created_by = str(uuid.UUID(str(user_id)))
    except ValueError:
        return jsonify({"success": False, "error": "Invalid user id in token"}), 400
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "INSERT INTO public.social_links (platform, url, icon, created_by) VALUES (%s,%s,%s,%s) RETURNING id",
            (data.get("platform"), data.get("url"), data.get("icon"), created_by)
        )
        social_link = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "social_link": dict(social_link)}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.get("/social-links")
def get_social_links():
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "SELECT id, platform, url, icon FROM public.social_links WHERE is_deleted = false ORDER BY created_at DESC"
        )
        social_links = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "social_links": [dict(row) for row in social_links]}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.put("/social-links/<string:social_link_id>")
@token_required
def update_social_link(social_link_id):
    data    = request.get_json()
    user_id = g.user.get("id")
    if not user_id:
        return jsonify({"success": False, "error": "User id not found in token"}), 401
    try:
        updated_by = str(uuid.UUID(str(user_id)))
    except ValueError:
        return jsonify({"success": False, "error": "Invalid user id in token"}), 400
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            UPDATE public.social_links SET
                platform   = %s,
                url        = %s,
                icon       = %s,
                updated_by = %s,
                updated_at = NOW()
            WHERE id = %s AND is_deleted = false
            RETURNING id
            """,
            (data.get("platform"), data.get("url"), data.get("icon"), updated_by, str(social_link_id))
        )
        social_link = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not social_link:
            return jsonify({"success": False, "error": "Social link not found"}), 404
        return jsonify({"success": True, "message": "Social link updated successfully", "social_link": dict(social_link)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.delete("/social-links/<string:social_link_id>")
@token_required
def delete_social_link(social_link_id):
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "UPDATE public.social_links SET is_deleted = true WHERE id = %s AND is_deleted = false RETURNING id",
            (str(social_link_id),)
        )
        social_link = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not social_link:
            return jsonify({"success": False, "error": "Social link not found"}), 404
        return jsonify({"success": True, "message": "Social link deleted successfully", "social_link": dict(social_link)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─── Profile ───────────────────────────────────────────────────────────────────

_PROFILE_COLUMNS = """
    id, name, title, roles, tagline, bio,
    photo_url, email, phone, location,
    years_of_experience, projects_completed, happy_clients,
    technologies_count, cv_url, created_at, updated_at
"""


def _json_field(value):
    if value is None:
        return None
    if isinstance(value, (list, dict)):
        return json.dumps(value)
    return value


def _format_profile(row):
    if not row:
        return None
    p = dict(row)
    roles = p.get("roles")
    if isinstance(roles, str):
        try:
            roles = json.loads(roles)
        except json.JSONDecodeError:
            roles = []
    if not isinstance(roles, list):
        roles = []
    p["roles"] = roles

    bio = p.get("bio")
    if isinstance(bio, str):
        try:
            parsed = json.loads(bio)
            bio = parsed if isinstance(parsed, list) else ([bio] if bio.strip() else [])
        except json.JSONDecodeError:
            bio = [line for line in bio.splitlines() if line.strip()]
    elif not isinstance(bio, list):
        bio = []
    p["bio"] = bio

    if p.get("photo_url"):
        p["photo"] = p["photo_url"]
    return p


@api_bp.get("/profile")
def get_profile():
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            f"SELECT {_PROFILE_COLUMNS} FROM public.profile WHERE is_deleted = false LIMIT 1"
        )
        profile = cursor.fetchone()
        cursor.close()
        conn.close()
        if not profile:
            return jsonify({"success": False, "error": "Profile not found"}), 404
        return jsonify({"success": True, "profile": _format_profile(profile)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.post("/profile")
@token_required
def create_profile():
    data    = request.get_json() or {}
    user_id = g.user.get("id")
    if not user_id:
        return jsonify({"success": False, "error": "User id not found in token"}), 401
    try:
        created_by = str(uuid.UUID(str(user_id)))
    except ValueError:
        return jsonify({"success": False, "error": "Invalid user id in token"}), 400
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT id FROM public.profile WHERE is_deleted = false LIMIT 1")
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Profile already exists. Use update instead."}), 409
        cursor.execute(
            f"""
            INSERT INTO public.profile (
                name, title, roles, tagline, bio,
                photo_url, email, phone, location,
                years_of_experience, projects_completed, happy_clients,
                technologies_count, cv_url, created_by
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING {_PROFILE_COLUMNS}
            """,
            (
                data.get("name"), data.get("title"),
                _json_field(data.get("roles", [])),
                data.get("tagline"),
                _json_field(data.get("bio", [])),
                data.get("photo_url") or data.get("photo"),
                data.get("email"), data.get("phone"), data.get("location"),
                data.get("years_of_experience", 0), data.get("projects_completed", 0),
                data.get("happy_clients", 0), data.get("technologies_count", 0),
                data.get("cv_url"),
                created_by,
            )
        )
        profile = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "profile": _format_profile(profile)}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.put("/profile/<string:profile_id>")
@token_required
def update_profile(profile_id):
    data    = request.get_json() or {}
    user_id = g.user.get("id")
    if not user_id:
        return jsonify({"success": False, "error": "User id not found in token"}), 401
    try:
        updated_by = str(uuid.UUID(str(user_id)))
    except ValueError:
        return jsonify({"success": False, "error": "Invalid user id in token"}), 400
    try:
        conn   = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            f"""
            UPDATE public.profile SET
                name                = %s,
                title               = %s,
                roles               = %s,
                tagline             = %s,
                bio                 = %s,
                photo_url           = %s,
                email               = %s,
                phone               = %s,
                location            = %s,
                years_of_experience = %s,
                projects_completed  = %s,
                happy_clients       = %s,
                technologies_count  = %s,
                cv_url              = %s,
                updated_by          = %s,
                updated_at          = %s
            WHERE id = %s AND is_deleted = false
            RETURNING {_PROFILE_COLUMNS}
            """,
            (
                data.get("name"), data.get("title"),
                _json_field(data.get("roles", [])),
                data.get("tagline"),
                _json_field(data.get("bio", [])),
                data.get("photo_url") or data.get("photo"),
                data.get("email"), data.get("phone"), data.get("location"),
                data.get("years_of_experience", 0), data.get("projects_completed", 0),
                data.get("happy_clients", 0), data.get("technologies_count", 0),
                data.get("cv_url"),
                updated_by, datetime.now(),
                str(uuid.UUID(profile_id)),
            )
        )
        profile = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not profile:
            return jsonify({"success": False, "error": "Profile not found"}), 404
        return jsonify({"success": True, "message": "Profile updated successfully", "profile": _format_profile(profile)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Contact
@api_bp.post("/contact")
def create_contact_message():
    data = request.get_json()
    try:
        conn = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            INSERT INTO public.contact_messages (name, email, subject, message)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        """
        values = (
            data.get("name"),
            data.get("email"),
            data.get("subject"),
            data.get("message"),
        )
        cursor.execute(query, values)
        contact_message = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({
            "success": True,
            "message": "Message sent successfully",
            "data": dict(contact_message),
        }), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@api_bp.get("/messages")
@token_required
def get_messages():
    try:
        conn = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            SELECT id, name, email, subject, message, is_read as read, received_at as created_at
            FROM public.contact_messages
            WHERE is_deleted = false
            ORDER BY received_at DESC
        """
        cursor.execute(query)
        messages = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({
            "success": True,
            "messages": [dict(row) for row in messages],
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@api_bp.put("/messages/<string:message_id>")
@token_required
def update_message(message_id):
    data = request.get_json()
    try:
        conn = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            UPDATE public.contact_messages SET
                is_read = %s
            WHERE id = %s AND is_deleted = false
            RETURNING id
        """
        values = (
            data.get("read", False),
            str(uuid.UUID(message_id)),
        )
        cursor.execute(query, values)
        message = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not message:
            return jsonify({"success": False, "error": "Message not found"}), 404
        return jsonify({
            "success": True,
            "message": "Message updated successfully",
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@api_bp.delete("/messages/<string:message_id>")
@token_required
def delete_message(message_id):
    try:
        conn = connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        query = """
            UPDATE public.contact_messages SET
                is_deleted = true
            WHERE id = %s AND is_deleted = false
            RETURNING id
        """
        values = (str(uuid.UUID(message_id)),)
        cursor.execute(query, values)
        message = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        if not message:
            return jsonify({"success": False, "error": "Message not found"}), 404
        return jsonify({
            "success": True,
            "message": "Message deleted successfully",
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500