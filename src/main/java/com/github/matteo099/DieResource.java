package com.github.matteo099;

import java.util.List;

import com.github.matteo099.model.DieDraw;
import com.github.matteo099.opencv.ShapeMatcher;

import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

@Path("/api/die")
public class DieResource {

    @Inject
    ShapeMatcher shapeMatcher;

    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/similar-dies")
    public List<DieDraw> getSimilarDies(DieDraw dieDraw, @QueryParam("threshold") @DefaultValue(value = "0.1") Float threshold) {
        return shapeMatcher.findSimilarShapes(dieDraw, threshold);
    }
}
