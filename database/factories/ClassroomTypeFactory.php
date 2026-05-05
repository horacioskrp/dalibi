<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ClassroomType>
 */
class ClassroomTypeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'        => fake()->unique()->words(2, true),
            'description' => fake()->optional()->sentence(),
            'active'      => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['active' => false]);
    }
}
