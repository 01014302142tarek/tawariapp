import test from "node:test";
import assert from "node:assert/strict";
import { cn, generateDoctorSlug, extractDoctorIdFromSlug } from "./utils";
import {
    egyptianPhoneSchema,
    emailSchema,
    professionalDetailsSchema,
    validateInput,
} from "./validations/index";
import {
    isSupabaseConfigured,
    getMockAccountByEmail,
    upsertMockGoogleAccount,
} from "./supabase/mock";

test("cn merges Tailwind classes properly", () => {
    assert.equal(cn("px-2 py-1", "px-4"), "py-1 px-4");
});

test("generateDoctorSlug formats doctor name and UUID", () => {
    const id = "30000000-0000-4000-a000-000000000001";
    assert.equal(
        generateDoctorSlug("Dr. Mohamed Ibrahim", id),
        `dr-mohamed-ibrahim-${id}`
    );
    assert.equal(
        generateDoctorSlug("Ahmed Hassan", id),
        `dr-ahmed-hassan-${id}`
    );
});

test("extractDoctorIdFromSlug extracts trailing UUID from slug", () => {
    const id = "30000000-0000-4000-a000-000000000001";
    const slug = `dr-mohamed-ibrahim-${id}`;
    assert.equal(extractDoctorIdFromSlug(slug), id);
});

test("validateInput validates Egyptian phone and professional details", () => {
    const validPhone = validateInput(egyptianPhoneSchema, "+201012345678");
    assert.equal(validPhone.success, true);

    const invalidPhone = validateInput(egyptianPhoneSchema, "01012345678");
    assert.equal(invalidPhone.success, false);

    const validEmail = validateInput(emailSchema, "patient1@tawari.test");
    assert.equal(validEmail.success, true);

    const validDoc = validateInput(professionalDetailsSchema, {
        licenseNumber: "SYN-10021",
        yearsOfExperience: 12,
        specialty: "Cardiology",
    });
    assert.equal(validDoc.success, true);
});

test("mock supabase helper detects unconfigured env vars and resolves demo accounts", () => {
    assert.equal(isSupabaseConfigured("", ""), false);
    assert.equal(
        isSupabaseConfigured("https://your-project.supabase.co", "your-anon-key"),
        false
    );
    assert.equal(
        isSupabaseConfigured("https://xyz.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"),
        true
    );

    const doctor = getMockAccountByEmail("doctor1@tawari.test");
    assert.ok(doctor);
    assert.equal(doctor.role, "doctor");

    const googleUser = getMockAccountByEmail("tbakr373@gmail.com");
    assert.ok(googleUser);
    assert.equal(googleUser.full_name, "Tarek Bakr");
    assert.equal(googleUser.role, "patient");
});

test("upsertMockGoogleAccount creates deterministic patient and doctor Google accounts", () => {
    const newPatient = upsertMockGoogleAccount({
        email: "new.patient.google@gmail.com",
        fullName: "Nour Google",
        role: "patient",
    });
    assert.equal(newPatient.email, "new.patient.google@gmail.com");
    assert.equal(newPatient.full_name, "Nour Google");
    assert.equal(newPatient.role, "patient");
    assert.ok(newPatient.patient_profile_id);

    const newDoctor = upsertMockGoogleAccount({
        email: "dr.google@gmail.com",
        fullName: "Dr. Google Specialist",
        role: "doctor",
    });
    assert.equal(newDoctor.email, "dr.google@gmail.com");
    assert.equal(newDoctor.role, "doctor");
    assert.ok(newDoctor.doctor_profile_id);
});

