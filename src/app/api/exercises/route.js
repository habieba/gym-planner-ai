import { exerciseLibrary } from "@/data/exerciseLibrary";

export async function GET(request, context) {
  const { id } = await context.params;

  const exercise = exerciseLibrary.find((item) => item.id === id);

  if (!exercise) {
    return Response.json(
      {
        error: "Exercise not found",
        requestedId: id,
        availableIds: exerciseLibrary.map((item) => item.id),
      },
      { status: 404 }
    );
  }

  return Response.json({
    exercise,
  });
}