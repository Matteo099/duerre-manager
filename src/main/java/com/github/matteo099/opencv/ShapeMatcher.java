package com.github.matteo099.opencv;

import java.util.ArrayList;
import java.util.List;

import org.opencv.core.MatOfPoint;
import org.opencv.core.Point;
import org.opencv.imgproc.Imgproc;

import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import nu.pattern.OpenCV;

public class ShapeMatcher {

    protected static Jsonb jsonb = JsonbBuilder.create();

    static {
        OpenCV.loadLocally(); 
    }

    public static void main(String[] args) {
        // Replace these paths with your actual paths
        String jsonRepresentation = "path/to/your/shape.json";
        String imageSetDirectory = "path/to/your/image/set";

        // Load the JSON representation of the shape
        String jsonShape = loadJsonShape(jsonRepresentation, new ShapePoint(120,122), new ShapePoint(312,212), new ShapePoint(224, 431));

        // Extract contours from the JSON representation
        List<MatOfPoint> shapeContours = extractContoursFromJson(jsonShape);

        // Match the shape with others in the set
        List<String> similarShapes = findSimilarShapes(shapeContours, imageSetDirectory);

        // Print or use the results
        System.out.println("Similar shapes found:");
        for (String similarShape : similarShapes) {
            System.out.println(similarShape);
        }
    }

    private static String loadJsonShape(String path, ShapePoint a, ShapePoint b, ShapePoint c) {
        return String.format("""
                {
                    "version": "5.3.0",
                    "objects": [
                      {
                        "type": "polygon",
                        "version": "5.3.0",
                        "originX": "left",
                        "originY": "top",
                        "left": 0,
                        "top": 0,
                        "width": 120,
                        "height": 100,
                        "fill": "white",
                        "stroke": "#000",
                        "strokeWidth": 2,
                        "strokeDashArray": null,
                        "strokeLineCap": "butt",
                        "strokeDashOffset": 0,
                        "strokeLineJoin": "miter",
                        "strokeUniform": false,
                        "strokeMiterLimit": 4,
                        "scaleX": 1,
                        "scaleY": 1,
                        "angle": 0,
                        "flipX": false,
                        "flipY": false,
                        "opacity": 1,
                        "shadow": null,
                        "visible": true,
                        "backgroundColor": "",
                        "fillRule": "nonzero",
                        "paintFirst": "fill",
                        "globalCompositeOperation": "source-over",
                        "skewX": 0,
                        "skewY": 0,
                        "points": [
                          { "x": %d, "y": %d },
                          { "x": %d, "y": %d },
                          { "x": %d, "y": %d }
                        ]
                      }
                    ],
                    "background": "black"
                }
                """, a.x, a.y, b.x, b.y, c.x, c.y);
    }

    private static List<MatOfPoint> extractContoursFromJson(String jsonShape) {
        // Parse the JSON string
        DieDraw shapeJson = jsonb.fromJson(jsonShape, DieDraw.class);

        // Extract contours from the points in the JSON representation
        List<MatOfPoint> contours = new ArrayList<>();
        for (ShapeObject object : shapeJson.objects) {
            object.normalizePoints();
            for (ShapePoint point : object.points) {
                contours.add(new MatOfPoint(new Point(point.x, point.y)));
            }
        }

        return contours;
    }

    private static List<String> findSimilarShapes(List<MatOfPoint> shapeContours, String imageSetDirectory) {
        List<String> similarShapes = new ArrayList<>();

        // Iterate through each image in the set
        for (String imagePath : getImagesInDirectory(imageSetDirectory)) {
            // Load the image from the set
            // Mat setImg = Imgcodecs.imread(imagePath, Imgcodecs.IMREAD_GRAYSCALE);

            // Extract contours from the set image
            // List<MatOfPoint> setContours = extractContours(setImg);

            // Load the JSON representation of the shape
            String savedShape = loadJsonShape("", new ShapePoint(1,1), new ShapePoint(1,2), new ShapePoint(2, 2));

            // Extract contours from the JSON representation
            List<MatOfPoint> setContours = extractContoursFromJson(savedShape);

            // Compare the shape with the set using matchShape
            double matchScore = Imgproc.matchShapes(shapeContours.get(0), setContours.get(0),
                    Imgproc.CV_CONTOURS_MATCH_I1, 0.0);

            // You can adjust the threshold based on your requirements
            if (matchScore < 0.1) {
                // Shapes are considered similar (you can adjust the threshold)
                similarShapes.add(imagePath);
            }
        }

        return similarShapes;
    }

    private static List<String> getImagesInDirectory(String directoryPath) {
        // Implement logic to get a list of image paths in the specified directory
        // Replace this with your actual implementation
        List<String> imagePaths = new ArrayList<>();
        imagePaths.add("directoryPath");
        // ...
        return imagePaths;
    }
}