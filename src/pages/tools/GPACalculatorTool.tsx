import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Plus, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { incrementToolUsage, addToHistory } from '@/lib/tools';
import { useAuth } from '@/hooks/useAuth';

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

const GRADE_POINTS: { [key: string]: number } = {
  'A+': 4.0, A: 4.0, 'A-': 3.7,
  'B+': 3.3, B: 3.0, 'B-': 2.7,
  'C+': 2.3, C: 2.0, 'C-': 1.7,
  'D+': 1.3, D: 1.0, F: 0.0,
};

export default function GPACalculatorTool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: '1',
      name: 'Semester 1',
      courses: [{ id: '1', name: '', credits: 3, grade: 'A' }],
    },
  ]);

  useEffect(() => {
    incrementToolUsage('gpa-calculator');
  }, []);

  const addSemester = () => {
    const newId = (semesters.length + 1).toString();
    setSemesters([
      ...semesters,
      {
        id: newId,
        name: `Semester ${newId}`,
        courses: [{ id: '1', name: '', credits: 3, grade: 'A' }],
      },
    ]);
  };

  const removeSemester = (semesterId: string) => {
    if (semesters.length > 1) {
      setSemesters(semesters.filter((s) => s.id !== semesterId));
    }
  };

  const addCourse = (semesterId: string) => {
    setSemesters(
      semesters.map((sem) => {
        if (sem.id === semesterId) {
          const newCourseId = (sem.courses.length + 1).toString();
          return {
            ...sem,
            courses: [
              ...sem.courses,
              { id: newCourseId, name: '', credits: 3, grade: 'A' },
            ],
          };
        }
        return sem;
      })
    );
  };

  const removeCourse = (semesterId: string, courseId: string) => {
    setSemesters(
      semesters.map((sem) => {
        if (sem.id === semesterId && sem.courses.length > 1) {
          return {
            ...sem,
            courses: sem.courses.filter((c) => c.id !== courseId),
          };
        }
        return sem;
      })
    );
  };

  const updateCourse = (
    semesterId: string,
    courseId: string,
    field: keyof Course,
    value: any
  ) => {
    setSemesters(
      semesters.map((sem) => {
        if (sem.id === semesterId) {
          return {
            ...sem,
            courses: sem.courses.map((course) =>
              course.id === courseId ? { ...course, [field]: value } : course
            ),
          };
        }
        return sem;
      })
    );
  };

  const calculateSemesterGPA = (semester: Semester) => {
    let totalPoints = 0;
    let totalCredits = 0;

    semester.courses.forEach((course) => {
      const points = GRADE_POINTS[course.grade] || 0;
      totalPoints += points * course.credits;
      totalCredits += course.credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const calculateCumulativeGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    semesters.forEach((sem) => {
      sem.courses.forEach((course) => {
        const points = GRADE_POINTS[course.grade] || 0;
        totalPoints += points * course.credits;
        totalCredits += course.credits;
      });
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    
    if (user && totalCredits > 0) {
      addToHistory(user.id, 'gpa-calculator', `Cumulative GPA: ${gpa}`);
    }

    return gpa;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/tools')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tools
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">GPA Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Multi-semester GPA calculator with grade scale customization
          </p>
        </div>

        <div className="space-y-6">
          {/* Cumulative GPA Display */}
          <div className="glass-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold mb-1">Cumulative GPA</h2>
                <p className="text-sm text-muted-foreground">Overall average across all semesters</p>
              </div>
              <div className="text-5xl font-bold text-primary">{calculateCumulativeGPA()}</div>
            </div>
          </div>

          {/* Semesters */}
          {semesters.map((semester) => (
            <div key={semester.id} className="glass-card p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{semester.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    GPA: {calculateSemesterGPA(semester)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => addCourse(semester.id)} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Add Course</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                  {semesters.length > 1 && (
                    <Button
                      onClick={() => removeSemester(semester.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {semester.courses.map((course, index) => (
                  <div key={course.id} className="grid grid-cols-1 sm:grid-cols-[2fr,1fr,1fr,auto] gap-2 items-end">
                    <div className="space-y-2">
                      {index === 0 && <Label>Course Name</Label>}
                      <Input
                        value={course.name}
                        onChange={(e) =>
                          updateCourse(semester.id, course.id, 'name', e.target.value)
                        }
                        placeholder="Course name"
                      />
                    </div>

                    <div className="space-y-2">
                      {index === 0 && <Label>Credits</Label>}
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={course.credits}
                        onChange={(e) =>
                          updateCourse(
                            semester.id,
                            course.id,
                            'credits',
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      {index === 0 && <Label>Grade</Label>}
                      <Select
                        value={course.grade}
                        onValueChange={(v) =>
                          updateCourse(semester.id, course.id, 'grade', v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(GRADE_POINTS).map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade} ({GRADE_POINTS[grade]})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={() => removeCourse(semester.id, course.id)}
                      size="icon"
                      variant="ghost"
                      className="text-red-400"
                      disabled={semester.courses.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Button onClick={addSemester} variant="outline" className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add Semester
          </Button>

          {/* Grade Scale Reference */}
          <div className="glass-card p-4 sm:p-6">
            <h3 className="font-semibold mb-3">Grade Scale</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-sm">
              {Object.entries(GRADE_POINTS).map(([grade, points]) => (
                <div key={grade} className="flex justify-between p-2 bg-black/20 rounded">
                  <span className="font-semibold">{grade}</span>
                  <span className="text-muted-foreground">{points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
