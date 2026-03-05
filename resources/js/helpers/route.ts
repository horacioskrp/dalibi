import { route as ziggyRoute } from 'ziggy-js';

/**
 * Generate a route URL
 * @param name - The route name (e.g., 'schools.index', 'schools.store')
 * @param params - Optional parameters for the route
 * @returns The generated route URL
 */
export function route(name: string, params?: any): string {
    const baseUrl = globalThis.location.origin;
    const routeMap: Record<string, string> = {
        // Schools routes
        'schools.index': '/schools',
        'schools.create': '/schools/create',
        'schools.store': '/schools',
        'schools.show': `/schools/${params}`,
        'schools.edit': `/schools/${params}/edit`,
        'schools.update': `/schools/${params}`,
        'schools.destroy': `/schools/${params}`,

        // Classrooms routes
        'classrooms.index': '/classrooms',
        'classrooms.create': '/classrooms/create',
        'classrooms.store': '/classrooms',
        'classrooms.show': `/classrooms/${params}`,
        'classrooms.edit': `/classrooms/${params}/edit`,
        'classrooms.update': `/classrooms/${params}`,
        'classrooms.destroy': `/classrooms/${params}`,

        // Classroom Types routes
        'classroom-types.index': '/classroom-types',
        'classroom-types.create': '/classroom-types/create',
        'classroom-types.store': '/classroom-types',
        'classroom-types.show': `/classroom-types/${params}`,
        'classroom-types.edit': `/classroom-types/${params}/edit`,
        'classroom-types.update': `/classroom-types/${params}`,
        'classroom-types.destroy': `/classroom-types/${params}`,

        // Roles routes
        'roles.index': '/roles',
        'roles.create': '/roles/create',
        'roles.store': '/roles',
        'roles.show': `/roles/${params}`,
        'roles.edit': `/roles/${params}/edit`,
        'roles.update': `/roles/${params}`,
        'roles.destroy': `/roles/${params}`,

        // Permissions routes
        'permissions.index': '/permissions',
        'permissions.create': '/permissions/create',
        'permissions.store': '/permissions',
        'permissions.show': `/permissions/${params}`,
        'permissions.edit': `/permissions/${params}/edit`,
        'permissions.update': `/permissions/${params}`,
        'permissions.destroy': `/permissions/${params}`,

        // Users routes
        'users.index': '/users',
        'users.create': '/users/create',
        'users.store': '/users',
        'users.show': `/users/${params}`,
        'users.edit': `/users/${params}/edit`,
        'users.update': `/users/${params}`,
        'users.destroy': `/users/${params}`,

        // Subjects routes
        'subjects.index': '/subjects',
        'subjects.create': '/subjects/create',
        'subjects.store': '/subjects',
        'subjects.show': `/subjects/${params}`,
        'subjects.edit': `/subjects/${params}/edit`,
        'subjects.update': `/subjects/${params}`,
        'subjects.destroy': `/subjects/${params}`,

        // Academic Years routes
        'academic-years.index': '/academic-years',
        'academic-years.create': '/academic-years/create',
        'academic-years.store': '/academic-years',
        'academic-years.show': `/academic-years/${params}`,
        'academic-years.edit': `/academic-years/${params}/edit`,
        'academic-years.update': `/academic-years/${params}`,
        'academic-years.destroy': `/academic-years/${params}`,

        // Levels routes
        'levels.index': '/levels',
        'levels.create': '/levels/create',
        'levels.store': '/levels',
        'levels.show': `/levels/${params}`,
        'levels.edit': `/levels/${params}/edit`,
        'levels.update': `/levels/${params}`,
        'levels.destroy': `/levels/${params}`,

        // Academic Periods routes
        'academic-periods.index': '/academic-periods',
        'academic-periods.create': '/academic-periods/create',
        'academic-periods.store': '/academic-periods',
        'academic-periods.show': `/academic-periods/${params}`,
        'academic-periods.edit': `/academic-periods/${params}/edit`,
        'academic-periods.update': `/academic-periods/${params}`,
        'academic-periods.destroy': `/academic-periods/${params}`,

        // Subject Assignments routes
        'subject-assignments.index': '/subject-assignments',
        'subject-assignments.create': '/subject-assignments/create',
        'subject-assignments.store': '/subject-assignments',
        'subject-assignments.show': `/subject-assignments/${params}`,
        'subject-assignments.edit': `/subject-assignments/${params}/edit`,
        'subject-assignments.update': `/subject-assignments/${params}`,
        'subject-assignments.destroy': `/subject-assignments/${params}`,

        // Schoolings routes
        'schoolings.index': '/schoolings',
        'schoolings.create': '/schoolings/create',
        'schoolings.store': '/schoolings',
        'schoolings.show': `/schoolings/${params}`,
        'schoolings.edit': `/schoolings/${params}/edit`,
        'schoolings.update': `/schoolings/${params}`,
        'schoolings.destroy': `/schoolings/${params}`,

        // Fee Categories routes
        'fee-categories.index': '/fee-categories',
        'fee-categories.create': '/fee-categories/create',
        'fee-categories.store': '/fee-categories',
        'fee-categories.show': `/fee-categories/${params}`,
        'fee-categories.edit': `/fee-categories/${params}/edit`,
        'fee-categories.update': `/fee-categories/${params}`,
        'fee-categories.destroy': `/fee-categories/${params}`,

        // Fee Structures routes
        'fee-structures.index': '/fee-structures',
        'fee-structures.create': '/fee-structures/create',
        'fee-structures.store': '/fee-structures',
        'fee-structures.show': `/fee-structures/${params}`,
        'fee-structures.edit': `/fee-structures/${params}/edit`,
        'fee-structures.update': `/fee-structures/${params}`,
        'fee-structures.destroy': `/fee-structures/${params}`,

        // Students routes
        'students.index': '/students',
        'students.create': '/students/create',
        'students.store': '/students',
        'students.show': `/students/${params}`,
        'students.edit': `/students/${params}/edit`,
        'students.update': `/students/${params}`,
        'students.destroy': `/students/${params}`,

        // Enrollments routes
        'enrollments.index': '/enrollments',
        'enrollments.create': '/enrollments/create',
        'enrollments.store': '/enrollments',
        'enrollments.show': `/enrollments/${params}`,
        'enrollments.receipt': `/enrollments/${params}/receipt`,
        'enrollments.edit': `/enrollments/${params}/edit`,
        'enrollments.update': `/enrollments/${params}`,
        'enrollments.destroy': `/enrollments/${params}`,
    };

    try {
        return ziggyRoute(name, params);
    } catch (error) {
        const routePath = routeMap[name];
        if (routePath) {
            return baseUrl + routePath;
        }

        const reason = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`Route "${name}" not found. Using fallback. Reason: ${reason}`);
        throw new Error(`Unknown route: ${name}`);
    }
}
